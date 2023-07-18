using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.ChangeTracking.Internal;
using Newtonsoft.Json;
using NuGet.Configuration;
using NuGet.Packaging;
using SoftTrello.Context;
using SoftTrello.Models;
using SoftTrello.Utils;
using System.Collections.Generic;
using System.Net;
using System.Runtime.ConstrainedExecution;

namespace SoftTrello.Controllers
{
    public class WorkspaceController : Controller
    {
        private readonly dbContext db;
        private IConfiguration ConfigRoot;
        public WorkspaceController(IConfiguration config, dbContext _db)
        {
            db = _db;
            ConfigRoot = config;
        }

        [Route("Workspace")]
        [HttpGet]
        public IActionResult Index()
        {
            return View();
        }

        [Route("Workspace/{id}")]
        [HttpGet]
        public IActionResult GetWorkspace()
        {
            return View();
        }

        [HttpPost]
        public JsonResult VerifyWorkspace(User me, string workspaceId)
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

                var exist = db.Workspaces.Where(x => x.Id == workspaceId).Any();

                return Json(JsonConvert.SerializeObject(new { type = "success", msg = "successListWorkspace", data = exist }, Tools.settings));
            }
            catch (Exception e)
            {
                return Json(JsonConvert.SerializeObject(new { type = "error", msg = e.Message }, Tools.settings));
            }
        }


        [HttpPost]
        public JsonResult GetWorkspace(User me, string workspaceId)
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

                var workspace = db.Workspaces.Where(x => x.Id == workspaceId).Select(x => new
                {
                    Id = x.Id,
                    Name = x.Name,
                    Abrev = (String.IsNullOrEmpty(x.Abrev) ? "" : x.Abrev),
                    Description = String.IsNullOrEmpty(x.Description) ? "": x.Description,
                    WebSite = String.IsNullOrEmpty(x.WebSite) ? "": x.WebSite,
                    Background = x.Background,
                    //Boards = x.Boards.ToList(),
                    //Users = x.UsersWorkspaces.Select(x=>x.User.Mail)
                }).FirstOrDefault();

                if (workspace == null)
                    return Json(JsonConvert.SerializeObject(new { type = "error", msg = "${notExistWorkspace}"}, Tools.settings));

                var userWorkspace = db.UserWorkspaces.Where(x => x.User.Mail == me.Mail && x.Workspace.Id == workspace.Id).SingleOrDefault();

                if (userWorkspace == null)
                    return Json(JsonConvert.SerializeObject(new { type = "error", msg = "${notExistUserInWorkspace}" }, Tools.settings));



                return Json(JsonConvert.SerializeObject(new { type = "success", msg = "successListWorkspace", data = workspace }, Tools.settings));
            }
            catch (Exception e)
            {
                return Json(JsonConvert.SerializeObject(new { type = "error", msg = e.Message }, Tools.settings));
            }
        }

        [HttpPost]
        public JsonResult GetMyWorkspace(User me)
        {
            try
            {
                switch (UserTools.isExistUser(me))
                {
                    case UserTools.ExistStatus.notExist:
                        return Json(JsonConvert.SerializeObject(new { type = "error", msg = "${notExistUser}" },  Tools.settings));
                    case UserTools.ExistStatus.Hack:
                        return Json(JsonConvert.SerializeObject(new { type = "login", msg = "${pleaseLogin}" },  Tools.settings));
                    default:
                        break;
                }

                var workspace = db.UserWorkspaces.Where(x=>x.User.Mail == me.Mail).Select(x=> new
                {
                    Id = x.Workspace.Id,
                    Name = x.Workspace.Name,
                    Description = x.Workspace.Description,
                    WebSite = x.Workspace.WebSite,
                    Background = x.Workspace.Background,
                    BoardCount = x.Workspace.Boards.Count()
                }).ToList();

                return Json(JsonConvert.SerializeObject(new { type = "success", msg = "successListWorkspace", data = workspace },  Tools.settings));
            }
            catch (Exception e)
            {
                return Json(JsonConvert.SerializeObject(new { type = "error", msg = e.Message },  Tools.settings));
            }
        }
        
        [HttpPost]
        public JsonResult Create(User me, Workspace workspace)
        {
            try
            {
                switch (UserTools.isExistUser(me))
                {
                    case UserTools.ExistStatus.notExist:
                        return Json(JsonConvert.SerializeObject(new { type = "error", msg = "${notExistUser}" },  Tools.settings));
                    case UserTools.ExistStatus.Hack:
                        return Json(JsonConvert.SerializeObject(new { type = "login", msg = "${pleaseLogin}" },  Tools.settings));
                    default:
                        break;
                }

                if (db.Workspaces.Any(x=>x.Name == workspace.Name)) return Json(JsonConvert.SerializeObject(new { type = "error", msg = "${ExistWorkspace}" },  Tools.settings));

                string Id = "";
                do
                {
                    Id = Guid.NewGuid().ToString();
                }while(db.Workspaces.Any(x=>x.Id ==Id));

                //Create new Workspace
                workspace = new Workspace()
                {
                    Id = Id,
                    Name = workspace.Name,
                    Boards = new List<Board>(),
                    Description = workspace.Description,
                    Background = workspace.Background,
                    Abrev = workspace.Abrev,
                    WebSite = workspace.WebSite,
                    isPublic = workspace.isPublic,
                    Type = workspace.Type,
                };

                me = CacheTrello.DUsers[me.Mail];
                var user = db.Users.SingleOrDefault(x => x.Mail == me.Mail);
                if (user == null) return Json(JsonConvert.SerializeObject(new { type = "error", msg = "${notExistUser}" }, Tools.settings));


                var updatedUser = me;

                Id = "";
                do
                {
                    Id = Guid.NewGuid().ToString();
                } while (db.UserWorkspaces.Any(x => x.Id == Id));

                var userWorkspace = new UserWorkspace()
                {
                    Id = Id,
                    Role = db.WorkspaceRoles.FirstOrDefault(),
                    Workspace = workspace,
                    User = user,
                    Date = DateTime.Now,
                };


                CacheTrello.DUsers[updatedUser.Mail] = updatedUser;

                try
                {
                    db.Workspaces.Add(workspace);
                    db.UserWorkspaces.Add(userWorkspace);

                    db.SaveChanges();

                    return Json(JsonConvert.SerializeObject(new { type = "success", msg = "${SuccessAddWorkspace}", data = workspace.Id },  Tools.settings));
                }
                catch (Exception e)
                {
                    return Json(JsonConvert.SerializeObject(new { type = "error", msg = e.Message },  Tools.settings));
                }
            }
            catch (Exception e)
            {
                return Json(JsonConvert.SerializeObject(new { type = "error", msg = e.Message },  Tools.settings));
            }
        }

        [HttpPost]
        public JsonResult AddUserWorkSpace(User me, string workspaceId, List<string> userMail)
        {
            try
            {
                switch (UserTools.isExistUser(me))
                {
                    case UserTools.ExistStatus.notExist:
                        return Json(JsonConvert.SerializeObject(new { type = "error", msg = "${notExistUser}" },  Tools.settings));
                    case UserTools.ExistStatus.Hack:
                        return Json(JsonConvert.SerializeObject(new { type = "login", msg = "${pleaseLogin}" },  Tools.settings));
                    default:
                        break;
                }

                var workspace = db.Workspaces.FirstOrDefault(x => x.Id == workspaceId);
                if (workspace==null) return Json(JsonConvert.SerializeObject(new { type = "error", msg = "${notExistWorkspace}" },  Tools.settings));

                foreach (var item in userMail)
                {
                    if (CacheTrello.DUsers.ContainsKey(item))
                    {
                        me = CacheTrello.DUsers[item];

                        if (!db.UserWorkspaces.Any(x => x.User.Id == me.Id && x.Workspace.Id == workspace.Id))
                        {
                            var user = db.Users.SingleOrDefault(x => x.Mail == me.Mail);
                            if (user == null) return Json(JsonConvert.SerializeObject(new { type = "error", msg = "${notExistUser}" }, Tools.settings));

                            var userWorkspace = new UserWorkspace()
                            {
                                Id = Guid.NewGuid().ToString(),
                                Role = db.WorkspaceRoles.FirstOrDefault(),
                                Workspace = workspace,
                                User = user
                            };

                            try
                            {
                                db.UserWorkspaces.Add(userWorkspace);

                                db.SaveChanges();
                            }
                            catch (Exception e)
                            {

                                //retourner les emails non valide
                            }
                        }
                        else
                        {
                            //retouner que l'utilisateur est déjà dans le workspace
                        }
                    }
                    else
                    {
                        var pvtKey = UserTools.GetPrivateKey();
                        var user = new User()
                        {
                            Id = Guid.NewGuid().ToString(),
                            PvtKey = pvtKey,
                            Password = UserTools.GetRandomPassword(pvtKey),
                            isNew = true,
                            UserWorkspaces = new List<UserWorkspace>(),
                            Mail = item
                        };
                        var userWorkspace = new UserWorkspace()
                        {
                            Id = Guid.NewGuid().ToString(),
                            Role = db.WorkspaceRoles.FirstOrDefault(),
                            Workspace = workspace,
                            User = user
                        };

                        CacheTrello.DUsers.Add(user.Mail, user);

                        try
                        {
                            db.Users.Add(user);
                            db.UserWorkspaces.Add(userWorkspace);
                        }
                        catch (Exception e)
                        {
                            //retourner les emails non valide
                        }
                    }
                }

                return Json(JsonConvert.SerializeObject(new { type = "success", msg = "${SuccessAddWorkspace}", data = "" },  Tools.settings));

            }
            catch (Exception e)
            {
                return Json(JsonConvert.SerializeObject(new { type = "error", msg = e.Message },  Tools.settings));
            }
        }

        [HttpPost]
        public JsonResult Delete(User me, string workspaceId)
        {
            try
            {
                switch (UserTools.isExistUser(me))
                {
                    case UserTools.ExistStatus.notExist:
                        return Json(JsonConvert.SerializeObject(new { type = "error", msg = "${notExistUser}" },  Tools.settings));
                    case UserTools.ExistStatus.Hack:
                        return Json(JsonConvert.SerializeObject(new { type = "login", msg = "${pleaseLogin}" },  Tools.settings));
                    default:
                        break;
                }

                var workspace = db.Workspaces.FirstOrDefault(x => x.Id == workspaceId);
                if (workspace == null) return Json(JsonConvert.SerializeObject(new { type = "error", msg = "${notExistWorkspace}" },  Tools.settings));

                try
                {
                    db.Workspaces.Remove(workspace);
                    db.UserWorkspaces.RemoveRange(db.UserWorkspaces.Where(x => x.Workspace.Id == workspaceId));
                    db.SaveChanges();

                    return Json(JsonConvert.SerializeObject(new { type = "success", msg = "${SuccessDeleteWorkspace}", data = "" },  Tools.settings));
                }
                catch (Exception e)
                {
                    return Json(JsonConvert.SerializeObject(new { type = "error", msg = e.Message },  Tools.settings));
                }
            }
            catch (Exception e)
            {
                return Json(JsonConvert.SerializeObject(new { type = "error", msg = e.Message },  Tools.settings));
            }
        }

        [HttpPost]
        public JsonResult DeleteUserWorkspace(User me, string workspaceName, List<string> mails)
        {
            try
            {
                switch (UserTools.isExistUser(me))
                {
                    case UserTools.ExistStatus.notExist:
                        return Json(JsonConvert.SerializeObject(new { type = "error", msg = "${notExistUser}" },  Tools.settings));
                    case UserTools.ExistStatus.Hack:
                        return Json(JsonConvert.SerializeObject(new { type = "login", msg = "${pleaseLogin}" },  Tools.settings));
                    default:
                        break;
                }

                var workspace = db.Workspaces.FirstOrDefault(x => x.Name == workspaceName);
                if (workspace == null) return Json(JsonConvert.SerializeObject(new { type = "error", msg = "${notExistWorkspace}" },  Tools.settings));

                foreach (var item in mails)
                {
                    try
                    {
                        db.UserWorkspaces.RemoveRange(db.UserWorkspaces.Where(x => x.Workspace.Id == workspace.Id && x.User.Mail == item));
                        db.SaveChanges();
                    }
                    catch (Exception e)
                    {
                        //retourner les emails non valide
                    }
                }
                return Json(JsonConvert.SerializeObject(new { type = "success", msg = "${SuccessDeleteUserWorkspace}", data = "" },  Tools.settings));
            }
            catch (Exception e)
            {
                return Json(JsonConvert.SerializeObject(new { type = "error", msg = e.Message },  Tools.settings));
            }
        }


        #region old

        #endregion
    }
}
