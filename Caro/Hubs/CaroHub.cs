using System;
using System.Linq;
using Caro.Models.ViewModels;
using System.Threading.Tasks;
using System.Collections.Generic;
using Microsoft.AspNetCore.SignalR;

namespace Caro.Hubs
{
    public class CaroHub : Hub
    {
        private static readonly List<Player> players = new List<Player>();
        private static readonly List<Room> rooms = new List<Room>();

        private readonly Position[] test1 = new Position[]
        {
            new Position { i = -4, j = -4 },
            new Position { i = -3, j = -3 },
            new Position { i = -2, j = -2 },
            new Position { i = -1, j = -1 },
            new Position { i = 0, j = 0 },
            new Position { i = 1, j = 1 },
            new Position { i = 2, j = 2 },
            new Position { i = 3, j = 3 },
            new Position { i = 4, j = 4 }
        };

        private readonly Position[] test2 = new Position[]
        {
            new Position { i = -4, j = 4 },
            new Position { i = -3, j = 3 },
            new Position { i = -2, j = 2 },
            new Position { i = -1, j = 1 },
            new Position { i = 0, j = 0 },
            new Position { i = 1, j = -1 },
            new Position { i = 2, j = -2 },
            new Position { i = 3, j = -3 },
            new Position { i = 4, j = -4 }
        };

        private readonly Position[] test3 = new Position[]
        {
            new Position { i = -4, j = 0 },
            new Position { i = -3, j = 0 },
            new Position { i = -2, j = 0 },
            new Position { i = -1, j = 0 },
            new Position { i = 0, j = 0 },
            new Position { i = 1, j = 0 },
            new Position { i = 2, j = 0 },
            new Position { i = 3, j = 0 },
            new Position { i = 4, j = 0 }
        };

        private readonly Position[] test4 = new Position[]
        {
            new Position { i = 0, j = -4 },
            new Position { i = 0, j = -3 },
            new Position { i = 0, j = -2 },
            new Position { i = 0, j = -1 },
            new Position { i = 0, j = 0 },
            new Position { i = 0, j = 1 },
            new Position { i = 0, j = 2 },
            new Position { i = 0, j = 3 },
            new Position { i = 0, j = 4 }
        };

        private byte[,] EmptyBoard
        {
            get
            {
                byte[,] board = new byte[28, 28];
                for (int i = 4; i < 24; i++)
                {
                    for (int j = 4; j < 24; j++)
                    {
                        board[i, j] = 1;
                    }
                }
                return board;
            }    
        }

        public override Task OnConnectedAsync()
        {
            Clients.Client(Context.ConnectionId).SendAsync("CreateBoard", EmptyBoard);
            Clients.All.SendAsync("UpdatePlayer", players.Select(p => p.Name).ToArray());
            return base.OnConnectedAsync();
        }

        public override Task OnDisconnectedAsync(Exception exception)
        {
            Player player = players.Find(p => p.ConnectionId == Context.ConnectionId);
            if (player != null && players.Remove(player))
            {
                Clients.All.SendAsync("UpdatePlayer", players.Select(p => p.Name).ToArray());
                Groups.RemoveFromGroupAsync(player.ConnectionId, player.RoomName);

                Room room = rooms.Find(r => r.RoomName == player.RoomName);
                if (room != null)
                {
                    if (room.MainPlayer?.Name == player.Name)
                    {
                        room.MainPlayer = null;
                    }
                    else if (room.Opponent?.Name == player.Name)
                    {
                        room.Opponent = null;
                    }

                    if (room.MainPlayer == null && room.Opponent == null)
                    {
                        rooms.Remove(room);
                    }
                    else
                    {
                        Clients.Group(player.RoomName).SendAsync("OpponentGiveUp");
                    }
                }
            }
            return base.OnDisconnectedAsync(exception);
        }

        public async Task ClientRequireNewBoard()
        {
            await Clients.Client(Context.ConnectionId).SendAsync("CreateBoard", EmptyBoard);
            await Clients.Client(Context.ConnectionId).SendAsync("WaitForFindingOpponent");
        }

        public async Task PlayerCompletesTurn(byte[,] board)
        {
            Player player = players.Find(p => p.ConnectionId == Context.ConnectionId);
            if (player != null)
            {
                byte[,] reverseBoard = ReverseBoard(board);
                await Clients.OthersInGroup(player.RoomName).SendAsync("UpdateBoardMap", reverseBoard);
            }
        }

        public async Task ApponentWon()
        {
            await Clients.Client(Context.ConnectionId).SendAsync("YouLose");
            await Clients.Others.SendAsync("YouWon");
        }

        public async Task ApponentDidnotWin(int i, int j, byte[,] board)
        {
            // Server kiem tra gian lan: Khong co gian lan xay ra
            if (CheckGame(i, j, board))
            {
                await Clients.Others.SendAsync("YouWon");
                await Clients.Client(Context.ConnectionId).SendAsync("YouLose");
            }
            else
            {
                await Clients.Others.SendAsync("YouCheat");
                await Clients.Client(Context.ConnectionId).SendAsync("YouWon");
            }
        }

        public async Task IWon(int i, int j, byte[,] board)
        {
            await Clients.Others.SendAsync("ConfirmApponentWin", i, j, board);
        }

        public async Task SomeoneRegister(string username)
        {
            if (players.Exists(p => p.Name == username))
            {
                await Clients.Client(Context.ConnectionId).SendAsync("ExistedUsername");
                return;
            }

            Player player = new Player
            {
                ConnectionId = Context.ConnectionId,
                Name = username
            };

            Room room = rooms.FirstOrDefault(r => r.Opponent == null);
            bool ready = false;
            if (room == null)
            {
                rooms.Add(room = new Room
                {
                    RoomName = username,
                    MainPlayer = player
                });
            }
            else
            {
                room.Opponent = player;
                ready = true;
            }

            player.RoomName = room.RoomName;
            players.Add(player);

            await Groups.AddToGroupAsync(player.ConnectionId, room.RoomName);
            await Clients.All.SendAsync("UpdatePlayer", players.Select(p => p.Name).ToArray());
            if (ready)
            {
                Random rand = new Random();
                int playerFirst = rand.Next(2);
                if (playerFirst == 0)
                {
                    await Clients.Client(player.ConnectionId).SendAsync("StartGameNow", true);
                    await Clients.OthersInGroup(player.RoomName).SendAsync("StartGameNow", false);
                }
                else
                {
                    await Clients.Client(player.ConnectionId).SendAsync("StartGameNow", false);
                    await Clients.OthersInGroup(player.RoomName).SendAsync("StartGameNow", true);
                }
            }
            else
            {
                await Clients.Client(player.ConnectionId).SendAsync("WaitForFindingOpponent");
            }
        }

        public async Task ClientSendMessage(string message)
        {
            Player player = players.Find(p => p.ConnectionId == Context.ConnectionId);
            if (player != null)
            {
                await Clients.OthersInGroup(player.RoomName).SendAsync("ServerSendMessageToOtherInGroup", player.Name, message);
            }
        }

        private byte[,] ReverseBoard(byte[,] board)
        {
            byte[,] reverseBoard = new byte[28, 28];
            for (int i = 4; i < 28; i++)
            {
                for (int j = 4; j < 28; j++)
                {
                    switch (board[i, j])
                    {
                        case 2:
                            reverseBoard[i, j] = 3;
                            break;
                        case 3:
                            reverseBoard[i, j] = 2;
                            break;
                        default:
                            reverseBoard[i, j] = 1;
                            break;
                    }
                }
            }
            return reverseBoard;
        }

        private bool CheckGame(int originI, int originJ, byte[,] board)
        {
            int count;
            for (int i = 0; i < 5; i++)
            {
                count = 0;
                for (int j = i; j < i + 5; j++)
                {
                    if (board[originI + test1[j].i, originJ + test1[j].j] == 2)
                    {
                        count++;
                    }
                }
                if (count == 5)
                {
                    return true;
                }
            }
            for (int i = 0; i < 5; i++)
            {
                count = 0;
                for (int j = i; j < i + 5; j++)
                {
                    if (board[originI + test2[j].i, originJ + test2[j].j] == 2)
                    {
                        count++;
                    }
                }
                if (count == 5)
                {
                    return true;
                }
            }
            for (int i = 0; i < 5; i++)
            {
                count = 0;
                for (int j = i; j < i + 5; j++)
                {
                    if (board[originI + test3[j].i, originJ + test3[j].j] == 2)
                    {
                        count++;
                    }
                }
                if (count == 5)
                {
                    return true;
                }
            }
            for (int i = 0; i < 5; i++)
            {
                count = 0;
                for (int j = i; j < i + 5; j++)
                {
                    if (board[originI + test4[j].i, originJ + test4[j].j] == 2)
                    {
                        count++;
                    }
                }
                if (count == 5)
                {
                    return true;
                }
            }
            return false;
        }
    }
}