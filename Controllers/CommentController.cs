using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using SoftTrello.Context;
using SoftTrello.Models;
using SoftTrello.Utils;
using System.Xml.Linq;

namespace SoftTrello.Controllers
{
    public class CommentController : Controller
    {
        private readonly dbContext db;
        private IConfiguration ConfigRoot;

        public CommentController(IConfiguration config, dbContext _db)
        {
            db = _db;
            ConfigRoot = config;
        }
        #region get
        [HttpPost]
        public JsonResult GetAllComments(User me, string cardId)
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
                var coms = db.Comments.Where(x => x.Card.Id == cardId).Select(x => new
                {
                   UserName = x.User.FirstName +" "+ x.User.LastName,
                   UserMail = x.User.Mail,
                   Comment = x.Description,
                   Date = x.Date,
                }).ToList();

                return Json(JsonConvert.SerializeObject(new { type = "success", msg = "${successListComments}", data = coms }, Tools.settings));
            }
            catch (Exception e)
            {
                return Json(JsonConvert.SerializeObject(new { type = "error", msg = e.Message }, Tools.settings));
            }
        }
        #endregion

        #region Create
        [HttpPost]
        public JsonResult SendComment(User me, string cardId, string coms, string reply)
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

                me = db.Users.FirstOrDefault(x => x.Mail == me.Mail);
                if (me == null) return Json(JsonConvert.SerializeObject(new { type = "error", msg = "${notExistUser}" }, Tools.settings));
                
                Card card = db.Cards. Single(x => x.Id == cardId);
                if(card == null) return Json(JsonConvert.SerializeObject(new { type = "error", msg = "${notExistComment}" }, Tools.settings));


                //Create new Comment
                Comment comment = new Comment()
                {
                    Id = Guid.NewGuid().ToString(),
                    Card = card,
                    Date = DateTime.Now,
                    Description = coms,
                    User = me
                };

                try
                {
                    //db.Comments.AddAsync(comment);
                    db.Comments.Add(comment);

                    db.SaveChanges();

                    var newComment = new
                    {
                        Id = comment.Id,
                        Date = comment.Date,
                        Description = comment.Description,
                        User = new
                        {
                            Name = comment.User.FirstName + " " + comment.User.LastName,
                            Mail = comment.User.Mail,
                        }
                    };

                    return Json(JsonConvert.SerializeObject(new { type = "success", msg = "${SuccessAddComment}", data = newComment }, Tools.settings));
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

        #region delete
        [HttpPost]
        public JsonResult Delete(User me, string comsId)
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

                var coms = db.Comments.FirstOrDefault(x => x.Id == comsId);
                if (coms == null) return Json(JsonConvert.SerializeObject(new { type = "error", msg = "${notExistComment}" }, Tools.settings));

                try
                {
                    db.Comments.Remove(coms);
                    db.SaveChanges();

                    return Json(JsonConvert.SerializeObject(new { type = "success", msg = "${SuccessDeleteComment}" }, Tools.settings));
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

        #region update
        [HttpPost]
        public JsonResult Update(User me, string comsId, string coms)
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

                var comment = db.Comments.FirstOrDefault(x => x.Id == comsId);
                if (comment == null) return Json(JsonConvert.SerializeObject(new { type = "error", msg = "${notExistComment}" }, Tools.settings));

                try
                {
                    comment.Description = coms;
                    db.Update(comment);

                    db.SaveChanges();

                    return Json(JsonConvert.SerializeObject(new { type = "success", msg = "${SuccessUpdateComment}" }, Tools.settings));
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
