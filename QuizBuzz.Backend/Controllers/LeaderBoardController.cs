using Microsoft.AspNetCore.Mvc;

namespace QuizBuzz.Backend.Controllers
{
    public class LeaderBoardController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
