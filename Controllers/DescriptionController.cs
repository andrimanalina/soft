using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using SoftTrello.Context;
using SoftTrello.Models;
using SoftTrello.Utils;

namespace SoftTrello.Controllers
{
    public class DescriptionController : Controller
    {
        private readonly dbContext db;
        private IConfiguration ConfigRoot;

        public DescriptionController(IConfiguration config, dbContext _db)
        {
            db = _db;
            ConfigRoot = config;
        }

        #region get
        [HttpPost]
        public JsonResult Get(User me, string cardId)
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
                var Card = db.Cards.Where(x => x.Id == cardId).Select(x => new
                {
                    Id = x.Id,
                    Name = x.Name,
                    Description = x.Description,
                }).FirstOrDefault();

                return Json(JsonConvert.SerializeObject(new { type = "success", msg = "${successListDescription}", data = Card }, Tools.settings));
            }
            catch (Exception e)
            {
                return Json(JsonConvert.SerializeObject(new { type = "error", msg = e.Message }, Tools.settings));
            }
        }
        [HttpPost]
        public JsonResult GetAll(User me, string cardId)
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

                var Card = db.Cards.Select(x => new
                {
                    Id = x.Id,
                    Name = x.Name,
                    Description = x.Description,
                }).OrderBy(x=>x.Name).ToList();

                return Json(JsonConvert.SerializeObject(new { type = "success", msg = "${successListDescription}", data = Card }, Tools.settings));
            }
            catch (Exception e)
            {
                return Json(JsonConvert.SerializeObject(new { type = "error", msg = e.Message }, Tools.settings));
            }
        }
        #endregion

        #region update
        [HttpPost]
        public JsonResult Update(User me, string cardId, string description)
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

                var updatedcard = db.Cards.FirstOrDefault(x => x.Id == cardId);
                if (updatedcard == null) return Json(JsonConvert.SerializeObject(new { type = "error", msg = "${notExistCard}" }, Tools.settings));


                try
                {
                    updatedcard.Description = description;

                    db.Cards.Update(updatedcard);

                    db.SaveChanges();

                    return Json(JsonConvert.SerializeObject(new { type = "success", msg = "${SuccessUpdateDescription}", data = "" }, Tools.settings));
                }
                catch (Exception e)
                {
                    return Json(JsonConvert.SerializeObject(new { type = "error", msg = e.Message }, Tools.settings));
                }
            }
            catch (Exception e)
            {
                return Json(JsonConvert.SerializeObject(new { type = "error", msg = e.Message }, Tools.settings));
            }
        }
        #endregion

    }
}
