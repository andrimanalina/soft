using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using SoftTrello.Context;
using SoftTrello.Models;
using SoftTrello.Utils;

namespace SoftTrello.Controllers
{
    public class BoardController : Controller
    {
        private readonly dbContext db;
        private IConfiguration ConfigRoot;

        public BoardController(IConfiguration config, dbContext _db)
        {
            db = _db;
            ConfigRoot = config;
        }


        [Route("Board/{id}")]
        [HttpGet]
        public IActionResult Index(string boardId)
        {
            return View();
        }

        [HttpPost]
        public JsonResult GetMyBoard(User me, string workspaceId)
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
                var boards = db.Boards.Where(x => x.Workspace.Id == workspaceId && (x.UserBoards.Any(y => y.User.Mail == me.Mail) || x.Visibility != BVisibility.Private)).Select(x => new
                {
                    Id = x.Id,
                    Name = x.Name,
                    Background = x.Background
                }).ToList();

                return Json(JsonConvert.SerializeObject(new { type = "success", msg = "${successListWorkspace}", data = boards },  Tools.settings));
            }
            catch (Exception e)
            {
                return Json(JsonConvert.SerializeObject(new { type = "error", msg = e.Message },  Tools.settings));
            }
        }

        [HttpPost]
        public JsonResult GetAllMyBoard(User me)
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
                var boards = db.UserBoards.Where(x => x.User.Mail == me.Mail).Select(x => new
                {
                    Name = x.Board.Name,
                    Background = x.Board.Background,
                    Workspace = x.Board.Workspace.Name
                }).GroupBy(x => x.Workspace).ToList();

                return Json(JsonConvert.SerializeObject(new { type = "success", msg = "${successListWorkspace}", data = boards },  Tools.settings));
            }
            catch (Exception e)
            {
                return Json(JsonConvert.SerializeObject(new { type = "error", msg = e.Message },  Tools.settings));
            }
        }

        [HttpPost]
        public JsonResult Create(User me, Workspace workspace, Board board)
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

                workspace = db.Workspaces.Single(x => x.Id == workspace.Id);
                if (workspace == null) return Json(JsonConvert.SerializeObject(new { type = "error", msg = "${notExistWorkspace}" },  Tools.settings));

                if (db.Boards.Any(x => x.Name == board.Name && x.Workspace.Id == workspace.Id)) return Json(JsonConvert.SerializeObject(new { type = "error", msg = "${ExistBoard}" },  Tools.settings));


                //Create new Workspace
                board = new Board()
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = board.Name,
                    Background = board.Background,
                    Workspace = workspace, 
                    Visibility = BVisibility.Private,
                };

                me = CacheTrello.DUsers[me.Mail];
                var user = db.Users.SingleOrDefault(x => x.Mail == me.Mail);
                if (user == null) return Json(JsonConvert.SerializeObject(new { type = "error", msg = "${notExistUser}" }, Tools.settings));
                


                var updatedUser = me;
                var userBoard = new UserBoard()
                {
                    Id = Guid.NewGuid().ToString(),
                    Role = UserBoardRole.Membre,
                    Board = board,
                    User = user
                };

                //user.UserBoards.Add(userBoard);
                //board.UserBoards.Add(userBoard);

                CacheTrello.DUsers[updatedUser.Mail] = updatedUser;

                try
                {

                    db.Boards.Add(board);
                    db.UserBoards.Add(userBoard);
                    
                    db.SaveChanges();

                    return Json(JsonConvert.SerializeObject(new { type = "success", msg = "${SuccessAddBoard}", data = "" },  Tools.settings));
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
        public JsonResult DeleteBoard(User me, string BoardId)
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

                var board = db.Boards.FirstOrDefault(x => x.Id == BoardId);
                if (board == null) return Json(JsonConvert.SerializeObject(new { type = "error", msg = "${notExistBoard}" },  Tools.settings));

                try
                {
                    db.Boards.Remove(board);
                    db.UserBoards.RemoveRange(db.UserBoards.Where(x => x.Board.Id == BoardId));
                    db.SaveChanges();

                    return Json(JsonConvert.SerializeObject(new { type = "success", msg = "${SuccessDeleteBoard}", data = "" },  Tools.settings));
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
        public JsonResult UpdateVisibility(User me, string boardId, BVisibility visibility)
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
                var board = db.Boards.Where(x => x.Id == boardId).FirstOrDefault();
                if(board == null) return Json(JsonConvert.SerializeObject(new { type = "error", msg = "${notExistBoard}" }, Tools.settings));

                board.Visibility = visibility;
                db.Update(board);
                db.SaveChanges();

                return Json(JsonConvert.SerializeObject(new { type = "success", msg = "${successListWorkspace}" }, Tools.settings));
            }
            catch (Exception e)
            {
                return Json(JsonConvert.SerializeObject(new { type = "error", msg = e.Message }, Tools.settings));
            }
        }

        #region Favoris
        [HttpPost]
        public JsonResult GetFavoris(User me)
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

                var favoris = db.UserBoards.Where(x => x.User.Mail == me.Mail && x.isFavoris).Select(x => new
                {
                    Id = x.Board.Id,
                    Name = x.Board.Name,
                    Letter = x.Board.Name[0],
                    Background = x.Board.Background,
                }).ToList();

                return Json(JsonConvert.SerializeObject(new { type = "success", msg = "${successGetFavoris}", data = favoris }, Tools.settings));
            }
            catch (Exception e)
            {
                return Json(JsonConvert.SerializeObject(new { type = "error", msg = e.Message }, Tools.settings));
            }
        }

        [HttpPost]
        public JsonResult UpdateFavoris(User me, string boardId, bool isFavoris)
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
                var userBoard = db.UserBoards.Where(x => x.User.Mail == me.Mail && x.Board.Id == boardId).FirstOrDefault();
                if (userBoard == null) return Json(JsonConvert.SerializeObject(new { type = "error", msg = "${notExistuserBoard}" }, Tools.settings));

                userBoard.isFavoris = isFavoris;
                db.Update(userBoard);
                db.SaveChanges();
                var Board = db.Boards.Where(x => x.UserBoards.Any(u => u.Id == userBoard.Id)).FirstOrDefault();
                var board = new
                {
                    Id = boardId,
                    Name = userBoard.Board.Name,
                    Letter = userBoard.Board.Name[0],
                    Background = userBoard.Board.Background
                };

                return Json(JsonConvert.SerializeObject(new { type = "success", msg = "${successUpdateFavoris}", data= board}, Tools.settings));
            }
            catch (Exception e)
            {
                return Json(JsonConvert.SerializeObject(new { type = "error", msg = e.Message }, Tools.settings));
            }
        }

        #endregion


        [HttpPost]
        public JsonResult UpdateName(User me, string boardId, string boardName)
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

                var board = db.Boards.Where(x => x.Id == boardId).FirstOrDefault();
                if (board == null) return Json(JsonConvert.SerializeObject(new { type = "error", msg = "${notExistBoard}" }, Tools.settings));

                board.Name= boardName;
                db.Update(board);
                db.SaveChanges();

                return Json(JsonConvert.SerializeObject(new { type = "success", msg = "${successUpdateBoardName}" }, Tools.settings));
            }
            catch (Exception e)
            {
                return Json(JsonConvert.SerializeObject(new { type = "error", msg = e.Message }, Tools.settings));
            }
        }



        #region membre
        [HttpPost]
        public JsonResult GetUserBoard(User me, string boardId)
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

                var board = db.Boards.FirstOrDefault(x => x.Id == boardId);
                if (board == null) return Json(JsonConvert.SerializeObject(new { type = "error", msg = "${notExistBoard}" }, Tools.settings));

                var userDetail = db.UserBoards.Where(x=>x.Board.Id == boardId).Select(x=> new
                {
                    Id = x.User.Id,
                    Mail = x.User.Mail,
                    Name = x.User.FirstName + " " + x.User.LastName,
                    Abbr = (string.IsNullOrEmpty(x.User.FirstName) && string.IsNullOrEmpty(x.User.LastName)) ?
                        x.User.Mail.ToUpper()[0] : string.IsNullOrEmpty(x.User.FirstName) ?
                            x.User.LastName.ToUpper()[0] : x.User.FirstName.ToUpper()[0],
                    Role = x.Role
                }).ToList();

                return Json(JsonConvert.SerializeObject(new { type = "success", msg = "${SuccessAddUserBoard}", data = userDetail }, Tools.settings));
            }
            catch (Exception e)
            {
                return Json(JsonConvert.SerializeObject(new { type = "error", msg = e.Message }, Tools.settings));
            }
        }
        [HttpPost]
        public JsonResult AddListUserBoard(User me, Board boardId, List<string> userMail)
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

                var board = db.Boards.FirstOrDefault(x => x.Id == boardId.Id);
                if (board == null) return Json(JsonConvert.SerializeObject(new { type = "error", msg = "${notExistBoard}" }, Tools.settings));

                foreach (var item in userMail)
                {
                    if (CacheTrello.DUsers.ContainsKey(item))
                    {
                        var user = CacheTrello.DUsers[item];
                        var updatedUser = user;
                        if (!db.UserBoards.Any(x => x.User.Id == user.Id && x.Board.Id == board.Id))
                        {
                            var userBoard = new UserBoard()
                            {
                                Id = Guid.NewGuid().ToString(),
                                //RoleId=CacheTrello.DWorkspaceRoles
                                //["user"].Id
                            };


                            updatedUser.UserBoards.Add(userBoard);
                            CacheTrello.DUsers[updatedUser.Mail] = updatedUser;


                            try
                            {
                                db.Users.Update(updatedUser);
                                db.UserBoards.Add(userBoard);

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
                            UserBoards = new List<UserBoard>(),
                            Mail = item
                        };
                        var userBoard = new UserBoard()
                        {
                            Id = Guid.NewGuid().ToString(),
                            //RoleId=CacheTrello.DWorkspaceRoles
                            //["user"].Id
                        };

                        user.UserBoards.Add(userBoard);
                        CacheTrello.DUsers.Add(user.Mail, user);

                        try
                        {
                            db.Users.Add(user);
                            db.UserBoards.Add(userBoard);
                        }
                        catch (Exception e)
                        {
                            //retourner les emails non valide
                        }
                    }
                }

                return Json(JsonConvert.SerializeObject(new { type = "success", msg = "${SuccessAddUserBoard}", data = "" }, Tools.settings));

            }
            catch (Exception e)
            {
                return Json(JsonConvert.SerializeObject(new { type = "error", msg = e.Message }, Tools.settings));
            }
        }
        [HttpPost]
        public JsonResult AddUserBoard(User me, string boardId, string member)
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

                var board = db.Boards.FirstOrDefault(x => x.Id == boardId);
                if (board == null) return Json(JsonConvert.SerializeObject(new { type = "error", msg = "${notExistBoard}" }, Tools.settings));

                User user = new User();
                if (CacheTrello.DUsers.ContainsKey(member))
                {
                    user = CacheTrello.DUsers[member];
                    if(!db.UserBoards.Any(x=>x.User.Id == user.Id && x.Board.Id == board.Id))
                    {
                        var userBoard = new UserBoard()
                        {
                            Id = Guid.NewGuid().ToString(),
                            Board= board,
                            User= user,
                            Date= DateTime.Now,
                        };
                        try
                        {
                            db.UserBoards.Add(userBoard);
                            db.Users.Update(user);

                            db.SaveChanges();
                        }
                        catch (Exception e)
                        {
                            return Json(JsonConvert.SerializeObject(new { type = "error", msg = e.Message }, Tools.settings));
                        }
                    }
                    else
                    {
                        return Json(JsonConvert.SerializeObject(new { type = "error", msg = "${UserAllreadyExistinBoard}", data = "" }, Tools.settings));
                    }

                }
                else
                {
                    var pvtKey = UserTools.GetPrivateKey();
                    user = new User()
                    {
                        Id = Guid.NewGuid().ToString(),
                        PvtKey = pvtKey,
                        Password = UserTools.GetRandomPassword(pvtKey),
                        isNew = true,
                        UserBoards = new List<UserBoard>(),
                        Mail = member,
                        
                    };

                    var userBoard = new UserBoard()
                    {
                        Id = Guid.NewGuid().ToString(),
                        Board = board,
                        User = user,
                        Date = DateTime.Now,
                    };


                    try
                    {
                        db.Users.Add(user);
                        db.UserBoards.Add(userBoard);

                        db.SaveChanges();

                        CacheTrello.DUsers.Add(user.Mail, user);
                    }
                    catch (Exception e)
                    {
                        return Json(JsonConvert.SerializeObject(new { type = "error", msg = e.Message }, Tools.settings));
                    }
                }

                var userDetail = new
                {
                    Id = user.Id,
                    Mail = user.Mail,
                    Name = user.FirstName + " " + user.LastName,
                    Abbr = (string.IsNullOrEmpty(user.FirstName) && string.IsNullOrEmpty(user.LastName)) ? 
                        user.Mail.ToUpper()[0] : string.IsNullOrEmpty(user.FirstName) ? 
                            user.LastName.ToUpper()[0] : user.FirstName.ToUpper()[0],
                };

                return Json(JsonConvert.SerializeObject(new { type = "success", msg = "${SuccessAddUserBoard}", data = userDetail }, Tools.settings));
            }
            catch (Exception e)
            {
                return Json(JsonConvert.SerializeObject(new { type = "error", msg = e.Message }, Tools.settings));
            }
        }

        [HttpPost]
        public JsonResult DeleteUserBoard(User me, string boardId, List<string> mails)
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

                var board = db.Boards.FirstOrDefault(x => x.Id == boardId);
                if (board == null) return Json(JsonConvert.SerializeObject(new { type = "error", msg = "${notExistBoard}" }, Tools.settings));

                foreach (var item in mails)
                {
                    try
                    {
                        db.UserBoards.RemoveRange(db.UserBoards.Where(x => x.Board.Id == boardId && x.User.Mail == item));
                        db.SaveChanges();
                    }
                    catch (Exception e)
                    {
                        //retourner les emails non valide
                    }
                }
                return Json(JsonConvert.SerializeObject(new { type = "success", msg = "${SuccessDeleteUserBoard}", data = "" }, Tools.settings));
            }
            catch (Exception e)
            {
                return Json(JsonConvert.SerializeObject(new { type = "error", msg = e.Message }, Tools.settings));
            }
        }
        #endregion
    }
}
