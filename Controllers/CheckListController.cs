using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using SoftTrello.Context;
using SoftTrello.Models;
using SoftTrello.Utils;

namespace SoftTrello.Controllers
{
    public class CheckListController : Controller
    {
        private readonly dbContext db;
        private IConfiguration ConfigRoot;

        public CheckListController(IConfiguration config, dbContext _db)
        {
            db = _db;
            ConfigRoot = config;
        }

        #region get
        [HttpPost]
        public JsonResult Get(User me, string checklist)
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
                var CheckList = db.CheckLists.Where(x => x.Id == checklist).Select(x => new
                {
                    Id = x.Id,
                    Name = x.Name,
                    Position = x.Position,
                    isFinished = x.isFinished
                }).FirstOrDefault();

                return Json(JsonConvert.SerializeObject(new { type = "success", msg = "${successListCheckList}", data = CheckList }, Tools.settings));
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
                var CheckList = db.CheckLists.Where(x => x.Card.Id == cardId).Select(x => new
                {
                    Id = x.Id,
                    Name = x.Name,
                    Position = x.Position,
                    isFinished = x.isFinished
                }).OrderBy(x => x.Position).ToList();

                return Json(JsonConvert.SerializeObject(new { type = "success", msg = "${successListCheckList}", data = CheckList }, Tools.settings));
            }
            catch (Exception e)
            {
                return Json(JsonConvert.SerializeObject(new { type = "error", msg = e.Message }, Tools.settings));
            }
        }
        #endregion

        #region create
        [HttpPost]
        public JsonResult Create(User me, string cardId, string todo)
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
                var Card = db.Cards.Single(x => x.Id == cardId);
                if (Card == null) return Json(JsonConvert.SerializeObject(new { type = "error", msg = "${notExistCard}" }, Tools.settings));

                //Create new Checklist
                var Checklist = new CheckList()
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = todo,
                    Card = Card,
                    isFinished = false
                };

                try
                {
                    db.CheckLists.Add(Checklist);

                    db.SaveChanges();

                    return Json(JsonConvert.SerializeObject(new { type = "success", msg = "${SuccessAddCheckList}", data = Checklist.Id }, Tools.settings));
                }catch(Exception e)
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

        #region Delete
        [HttpPost]
        public JsonResult Delete(User me, string id)
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
                var Checklist = db.CheckLists.SingleOrDefault(x => x.Id == id);
                if (Checklist == null) return Json(JsonConvert.SerializeObject(new { type = "error", msg = "${notExistCheckList}" }, Tools.settings));

                try
                {
                    db.CheckLists.Remove(Checklist);

                    db.SaveChanges();

                    return Json(JsonConvert.SerializeObject(new { type = "success", msg = "${SuccessRemoveCheckList}", data = Checklist.Name }, Tools.settings));
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

        [HttpPost]
        public JsonResult DeleteAll(User me, string id)
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
                var exist = db.Cards.Any(x => x.Id == id);
                if (!exist) return Json(JsonConvert.SerializeObject(new { type = "error", msg = "${notExistCheckList}" }, Tools.settings));

                try
                {
                    var checklist = db.CheckLists.Where(x => x.Card.Id == id);
                    db.CheckLists.RemoveRange(checklist);

                    db.SaveChanges();

                    return Json(JsonConvert.SerializeObject(new { type = "success", msg = "${SuccessRemoveCheckList}" }, Tools.settings));
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

        #region Update
        [HttpPost]
        public JsonResult Update(User me, string checkId, bool checkVal)
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
                var Checklist = db.CheckLists.SingleOrDefault(x => x.Id == checkId);
                if (Checklist == null) return Json(JsonConvert.SerializeObject(new { type = "error", msg = "${notExistCheckList}" }, Tools.settings));

                try
                {
                    Checklist.isFinished = checkVal;
                    db.CheckLists.Update(Checklist);

                    db.SaveChanges();

                    return Json(JsonConvert.SerializeObject(new { type = "success", msg = "${SuccessRemoveCheckList}", data = Checklist.Name }, Tools.settings));
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
