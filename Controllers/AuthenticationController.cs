using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using Newtonsoft.Json;
using SoftTrello.Context;
using SoftTrello.Models;
using SoftTrello.Utils;

namespace SoftTrello.Controllers
{
    //[Route("api/[controller]")]
    public class AuthenticationController : Controller
    {
        private readonly dbContext db;
        private IConfiguration ConfigRoot;
        public AuthenticationController(IConfiguration config, dbContext _db)
        {
            db = _db;
            ConfigRoot = config;
        }

        //[Route("Index")]
        public IActionResult Index()
        {
            /*if (!CacheTrello.first)
            {
                CacheTrello.first = true;
                var x = db.Roles.Add(new Role()
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = "tessdt54"
                });
                var s = db.Roles.ToList();
            }
            else
            {
                db.SaveChanges();
                var x = db.Roles.ToList();
            }
            db.Roles.Any();
            db.Users.Any();
            */
            CacheTrello.DRoles.Any();
            #region test encrypt
            Security security = new Security();
            var bpub = security.GetKey(true);
            var bpri = security.GetKey(false);
            var encode = security.Encrypt("test");
            var decode = security.Decrypt(encode);

            //var user = db.Users.ToList();
            return View();
            #endregion
        }

        public IActionResult Login()
        {
            ViewBag.Root = ConfigRoot.GetValue<string>("root");
            return View();
        }
        //Auth Login Controller
        [HttpPost]
        public JsonResult Login(User me)
        {
            try
            {
                if (!CacheTrello.DUsers.ContainsKey(me.Mail)) 
                    return Json(JsonConvert.SerializeObject(new { 
                        type = "error", 
                        message = "Veuillez verifier votre Mail et/ou Mot de passe, SVP!" 
                    },  Tools.settings));

                var user = CacheTrello.DUsers[me.Mail];
                if(user.Mail == me.Mail && user.Password == me.Password) return Json(JsonConvert.SerializeObject(new { type = "success", message = "${LoginCorrect}" },  Tools.settings));
                return Json(JsonConvert.SerializeObject(new { type = "login", message = "${LoginIncorrect}" },  Tools.settings));
            }
            catch (Exception e)
            {
                return Json(JsonConvert.SerializeObject(new { type = "error", message = e.Message },  Tools.settings));
            }
        }
        //Auth Singin Controller
        [HttpPost]
        public JsonResult Register(User user)
        {
            try
            {
                if (CacheTrello.DUsers.ContainsKey(user.Mail))
                    return Json(JsonConvert.SerializeObject(new { type = "error", message = "Le mail que vous avez entrer est déjà associer à un compte" },  Tools.settings));

                var password = user.Password;
                var pvtKey = password;

                user = new User()
                {
                    Id = Guid.NewGuid().ToString(),
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    Mail = user.Mail,
                    Password = password,
                    PvtKey = pvtKey,
                    isNew = false
                };

                while (CacheTrello.DUsers.Any(x => x.Value.Id == user.Id)) { user.Id = Guid.NewGuid().ToString(); }
                
                try
                {
                    db.Users.Add(user);
                    db.SaveChanges();
                    CacheTrello.DUsers.Add(user.Mail, user);

                    return Json(JsonConvert.SerializeObject(new { },  Tools.settings));
                }
                catch (Exception e)
                {
                    if (CacheTrello.DUsers.ContainsKey(user.Mail)) CacheTrello.DUsers.Remove(user.Mail);
                    if(db.Users.Contains(user)) db.Users.Remove(user);

                    return Json(JsonConvert.SerializeObject(new { type = "error", message = e.Message },  Tools.settings));
                }
            }
            catch (Exception e)
            {

                return Json(JsonConvert.SerializeObject(new { type = "error", message = e.Message },  Tools.settings));
            }
        }
    }
}
