using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using NuGet.Protocol;
using SoftTrello.Context;
using SoftTrello.Models;
using SoftTrello.Utils;
using System.Diagnostics;

namespace SoftTrello.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;
        private readonly dbContext db;
        private readonly IConfiguration ConfigRoot;

        public HomeController(ILogger<HomeController> logger, IConfiguration config, dbContext _db)
        {
            _logger = logger;
            db = _db;
            ConfigRoot = config;
        }
        [Route("/Accueil")]
        public IActionResult Index()
        {
            return View();
        }


		[HttpPost]
		public JsonResult GetDashboard(User me)
		{
			try
			{
				switch (UserTools.isExistUser(me))
				{
					case UserTools.ExistStatus.notExist:
						return Json(JsonConvert.SerializeObject(new { type = "error", msg = "${notExistUser}" }, Tools.settings));
					case UserTools.ExistStatus.Hack:
						return Json(JsonConvert.SerializeObject(new { type = "login", msg = "${pleaseLogin}" }, Tools.settings));
					default:
						break;
				}

                var dashboard = new
                {
					workspace = db.UserWorkspaces.Where(x => x.User.Mail == me.Mail).Count(),
					board = db.UserBoards.Where(x => x.User.Mail == me.Mail).Count(),
					card = db.UserCards.Where(x => x.User.Mail == me.Mail).Count(),
				};

				return Json(JsonConvert.SerializeObject(new { type = "success", msg = "successListWorkspace", data = dashboard }, Tools.settings));
			}
			catch (Exception e)
			{
				return Json(JsonConvert.SerializeObject(new { type = "error", msg = e.Message }, Tools.settings));
			}
		}

		public IActionResult Privacy()
        {
            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = System.Diagnostics.Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}