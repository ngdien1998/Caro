using Microsoft.AspNetCore.Mvc;

namespace Caro.Controllers
{
    public class CaroController : Controller
    {
        public IActionResult Play()
        {
            return View();
        }
    }
}