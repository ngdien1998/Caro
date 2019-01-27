using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Caro.Models.ViewModels
{
    public class Room
    {
        public string RoomName { get; set; }
        public Player MainPlayer { get; set; }
        public Player Opponent { get; set; }
    }
}
