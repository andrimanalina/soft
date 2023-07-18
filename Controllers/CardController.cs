using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Newtonsoft.Json;
using SoftTrello.Context;
using SoftTrello.Models;
using SoftTrello.Utils;

namespace SoftTrello.Controllers
{
    public class CardController : Controller
    {
        private readonly dbContext db;
        private IConfiguration ConfigRoot;
        private readonly IHubContext<SignalRServer> signalrHub;

        public CardController(IConfiguration config, dbContext _db, IHubContext<SignalRServer> _signalrHub)
        {
            db = _db;
            ConfigRoot = config;
            signalrHub = _signalrHub;
        }

        [HttpGet]
        public IActionResult Index()
        {
            return View();
        }

        #region get
        [HttpPost]
        public JsonResult GetAllCards(User me, string board)
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
                var states = db.States.Where(x => x.Board.Id == board).Select(x => new
                {
                    Id = x.Id,
                    Name = x.Name,
                    Position = x.Position,
                    Cards = x.Cards.Select(c=> new { 
                        Id = c.Id,
                        Name = c.Name,
                        Position = c.Position,
                        Date = c.StartDate != null || c.EndDate != null,
                        Description = !String.IsNullOrEmpty(c.Description),
                        Comments = c.Comments.Count(),
                    })
                }).OrderByDescending(x => x.Position).ToList();

                return Json(JsonConvert.SerializeObject(new { type = "success", msg = "${successListCards}", data = states },  Tools.settings));
            }
            catch (Exception e)
            {
                return Json(JsonConvert.SerializeObject(new { type = "error", msg = e.Message },  Tools.settings));
            }
        }

        [HttpPost]
        public JsonResult GetCard(User me, string cardId)
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
                var exist = db.Cards.Any(x => x.Id == cardId);
                if(!exist) return Json(JsonConvert.SerializeObject(new { type = "error", msg = "${notExistCard}" }, Tools.settings));

                var card = db.Cards.Where(x => x.Id == cardId).Select(x => new
                {
                    Description = string.IsNullOrEmpty(x.Description) ? "" : x.Description,
                    StartDate = x.StartDate, 
                    EndDate = x.EndDate,
                    isFinished = x.isFinished,
                    CheckList = x.CheckLists.Where(y=>y.Card.Id == cardId).OrderBy(y=>y.Position).Select(y => new
                    {
                        Id = y.Id,
                        Name = y.Name,
                        StartDate = y.StartDate, 
                        EndDate =y.EndDate, 
                        isFinished = y.isFinished, 
                        Position = y.Position
                    }).ToList(),
                    Members = x.UserCards.Where(y=>y.Card.Id == cardId).Select(y=> new
                    {
                        Id = y.User.Id,
                        Mail = y.User.Mail,
                        Name = y.User.FirstName + " " + y.User.LastName,
                        Abbr = (string.IsNullOrEmpty(y.User.FirstName) && string.IsNullOrEmpty(y.User.LastName)) ?
                        y.User.Mail.ToUpper()[0] : string.IsNullOrEmpty(y.User.FirstName) ?
                            y.User.LastName.ToUpper()[0] : y.User.FirstName.ToUpper()[0],
                    }).ToList(),
                    Comments = x.Comments.Where(y=>y.Card.Id == cardId).Select(y=> new
                    {
                        Id = y.Id,
                        Date = y.Date,
                        Description = y.Description,
                        User = new
                        {
                            Name = y.User.FirstName + " " + y.User.LastName,
                            Mail = y.User.Mail,
                        }
                    }).OrderByDescending(y=>y.Date).ToList()
                }).SingleOrDefault();

                return Json(JsonConvert.SerializeObject(new { type = "success", msg = "${successListCards}", data = card }, Tools.settings));
            }
            catch (Exception e)
            {
                return Json(JsonConvert.SerializeObject(new { type = "error", msg = e.Message }, Tools.settings));
            }
        }
        #endregion

        #region create
        //[HttpPost]
        //public async Task<JsonResult> CreateState(User me, State state, Board board)
        //{
        //    try
        //    {
        //        switch (UserTools.isExistUser(me))
        //        {
        //            case UserTools.ExistStatus.notExist:
        //                return Json(JsonConvert.SerializeObject(new { type = "error", msg = "${notExistUser}" },  Tools.settings));
        //            case UserTools.ExistStatus.Hack:
        //                return Json(JsonConvert.SerializeObject(new { type = "login", msg = "${pleaseLogin}" },  Tools.settings));
        //            default:
        //                break;
        //        }

        //        board = db.Boards.Single(x => x.Id == board.Id);
        //        if (board == null) return Json(JsonConvert.SerializeObject(new { type = "error", msg = "${notExistBoard}" },  Tools.settings));

        //        if (db.States.Any(x => x.Name == state.Name && x.Board.Id == board.Id)) return Json(JsonConvert.SerializeObject(new { type = "error", msg = "${ExistState}" },  Tools.settings));


        //        //Create new Workspace
        //        state = new State()
        //        {
        //            Id = Guid.NewGuid().ToString(),
        //            Name = state.Name,
        //            Board = board,
        //            Position = state.Position,
        //        };

        //        try
        //        {
        //            db.States.Add(state);

        //            db.SaveChanges();

        //            await signalrHub.Clients.All.SendAsync("AddState");

        //            return Json(JsonConvert.SerializeObject(new { type = "success", msg = "${SuccessAddState}", data = "" },  Tools.settings));
        //        }
        //        catch (Exception e)
        //        {
        //            return Json(JsonConvert.SerializeObject(new { type = "error", msg = e.Message },  Tools.settings));
        //        }
        //    }
        //    catch (Exception e)
        //    {
        //        return Json(JsonConvert.SerializeObject(new { type = "error", msg = e.Message },  Tools.settings));
        //    }
        //}

        [HttpPost]
        public JsonResult CreateCard(User me, State state, Card card)
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

                state = db.States.Single(x=>x.Id == state.Id);
                if (state == null) return Json(JsonConvert.SerializeObject(new { type = "error", msg = "${notExistState}" },  Tools.settings));

                if (db.Cards.Any(x => x.Name == card.Name && x.State.Id == state.Id)) return Json(JsonConvert.SerializeObject(new { type = "error", msg = "${ExistCard}" },  Tools.settings));


                //Create new Workspace
                card = new Card()
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = card.Name,
                    State = state, 
                    Position = card.Position,
                };

                try
                {
                    db.Cards.Add(card);

                    db.SaveChanges();

                    return Json(JsonConvert.SerializeObject(new { type = "success", msg = "${SuccessAddCard}", data = card.Id },  Tools.settings));
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
        #endregion

        #region delete
        [HttpPost]
        public JsonResult DeleteState(User me, string stateid)
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

                var state = db.States.FirstOrDefault(x => x.Id == stateid);
                if (state == null) return Json(JsonConvert.SerializeObject(new { type = "error", msg = "${notExistState}" },  Tools.settings));

                try
                {
                    db.States.Remove(state);
                    db.Cards.RemoveRange(db.Cards.Where(x => x.State.Id == stateid));
                    db.SaveChanges();

                    return Json(JsonConvert.SerializeObject(new { type = "success", msg = "${SuccessDeleteState}", data = "" },  Tools.settings));
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
        public JsonResult DeleteCard(User me, string cardId)
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

                var card = db.Cards.FirstOrDefault(x => x.Id == cardId);
                if (card == null) return Json(JsonConvert.SerializeObject(new { type = "error", msg = "${notExistCard}" },  Tools.settings));

                try
                {
                    db.Cards.Remove(card);
                    db.SaveChanges();

                    return Json(JsonConvert.SerializeObject(new { type = "success", msg = "${SuccessDeleteCard}", data = card.Name },  Tools.settings));
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
        #endregion

        #region update

        [HttpPost]
        public JsonResult UpdateCard(User me, Card card)
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

                var updatedcard = db.Cards.FirstOrDefault(x => x.Id == card.Id);
                if (updatedcard == null) return Json(JsonConvert.SerializeObject(new { type = "error", msg = "${notExistCard}" },  Tools.settings));


                try
                {
                    updatedcard.Name = (updatedcard.Name == card.Name) ? updatedcard.Name : card.Name;
                    updatedcard.Description = (updatedcard.Description == card.Description) ? updatedcard.Description : card.Description;
                    updatedcard.State = (updatedcard.State.Equals(card.State)) ? updatedcard.State : card.State;

                    db.SaveChanges();

                    return Json(JsonConvert.SerializeObject(new { type = "success", msg = "${SuccessUpdateCard}", data = "" },  Tools.settings));
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
        public JsonResult UpdateDate(User me, string cardId, DateTime? start, DateTime? end)
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
                    updatedcard.StartDate = start;
                    updatedcard.EndDate = end;

                    db.Cards.Update(updatedcard);

                    db.SaveChanges();

                    return Json(JsonConvert.SerializeObject(new { type = "success", msg = "${SuccessUpdateCard}", data = "" }, Tools.settings));
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
        public JsonResult UpdatePosition(User me, string cardId, int cardPos, string stateId)
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
                var updatedCard = db.Cards.FirstOrDefault(x => x.Id == cardId);
                if (updatedCard == null) return Json(JsonConvert.SerializeObject(new { type = "error", msg = "${notExistCard}" }, Tools.settings));


                var state = db.States.Where(y => y.Cards.Any(x=>x.Id == updatedCard.Id)).FirstOrDefault();

                try
                {
                    state = db.States.Where(x => x.Id == stateId).FirstOrDefault();
                    if (state== null) return Json(JsonConvert.SerializeObject(new { type = "error", msg = "${notExistState}" }, Tools.settings));

                    var oldState = updatedCard.State.Id;
                    bool sameState = state.Id == updatedCard.Id;

                    //update the moving Card
                    updatedCard.State = state;
                    updatedCard.Position = cardPos;

                    //updatedcard.Name = (updatedcard.Name == card.Name) ? updatedcard.Name : card.Name;
                    //updatedcard.Description = (updatedcard.Description == card.Description) ? updatedcard.Description : card.Description;
                    //updatedcard.State = (updatedcard.State.Equals(card.State)) ? updatedcard.State : card.State;

                    db.Cards.Update(updatedCard);

                    db.SaveChanges();

                    //get all card that position is > moving card Position
                    var cards = db.Cards.Where(x=>x.State.Id == stateId && x.Id != updatedCard.Id).OrderBy(x=>x.Position).ToList();

                    int i = 0;
                    foreach (var item in cards)
                    {
                        if(item.Position == cardPos) i++;
                        i++;
                        item.Position = i;
                        db.Cards.Update(item);
                    }

                    //if not the same state : update the oldstate cards position
                    if (!sameState)
                    {
                        cards = db.Cards.Where(x => x.State.Id == oldState).OrderBy(x => x.Position).ToList();

                        i = 0;
                        foreach (var item in cards)
                        {
                            i++;
                            item.Position = i;
                            db.Cards.Update(item);
                        }
                    }
                    

                    db.SaveChanges();


                    return Json(JsonConvert.SerializeObject(new { type = "success", msg = "${SuccessUpdateCardPosition}", data = "" }, Tools.settings));
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

        #region membre
        [HttpPost]
        public JsonResult AddUserCard(User me, string cardId, string member)
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

                var card = db.Cards.FirstOrDefault(x => x.Id == cardId);
                if (card == null) return Json(JsonConvert.SerializeObject(new { type = "error", msg = "${notExistCard}" }, Tools.settings));
                var state = db.States.Where(x=>x.Cards.Contains(card)).FirstOrDefault();
                var board = db.Boards.Where(x=>x.States.Contains(state)).FirstOrDefault();
                var datenow = DateTime.Now;
                User user = new User();
                if (CacheTrello.DUsers.ContainsKey(member))
                {
                    user = CacheTrello.DUsers[member];
                    //test if already exist in board
                    if (!db.UserBoards.Any(x => x.User.Id == user.Id && x.Board.Id == card.State.Board.Id))
                    {
                        var userBoard = new UserBoard()
                        {
                            Id = Guid.NewGuid().ToString(),
                            Board = card.State.Board,
                            User = user,
                            Date = datenow,
                        };
                        try
                        {
                            db.UserBoards.Add(userBoard);

                            db.SaveChanges();
                        }
                        catch (Exception e)
                        {
                            return Json(JsonConvert.SerializeObject(new { type = "error", msg = e.Message }, Tools.settings));
                        }
                    }
                    //test if already exist in card
                    if (!db.UserCards.Any(x => x.User.Id == user.Id && x.Card.Id == card.Id))
                    {
                        var userCard = new UserCard()
                        {
                            Id = Guid.NewGuid().ToString(),
                            Card = card,
                            User = user,
                            Date = datenow,
                        };
                        try
                        {
                            db.UserCards.Add(userCard);

                            db.SaveChanges();
                        }
                        catch (Exception e)
                        {
                            return Json(JsonConvert.SerializeObject(new { type = "error", msg = e.Message }, Tools.settings));
                        }
                    }
                    else
                    {
                        return Json(JsonConvert.SerializeObject(new { type = "error", msg = "${UserAllreadyExistinCard}", data = "" }, Tools.settings));
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
                        Mail = member,

                    };

                    var userBoard = new UserBoard()
                    {
                        Id = Guid.NewGuid().ToString(),
                        Board = card.State.Board,
                        User = user,
                        Date = datenow,
                    };

                    var userCard = new UserCard()
                    {
                        Id = Guid.NewGuid().ToString(),
                        Card = card,
                        User = user,
                        Date = datenow,
                    };


                    try
                    {
                        db.Users.Add(user);
                        db.UserBoards.Add(userBoard);
                        db.UserCards.Add(userCard);

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

                return Json(JsonConvert.SerializeObject(new { type = "success", msg = "${SuccessAddUserCard}", data = userDetail }, Tools.settings));
            }
            catch (Exception e)
            {
                return Json(JsonConvert.SerializeObject(new { type = "error", msg = e.Message }, Tools.settings));
            }
        }

        [HttpPost]
        public JsonResult DeleteUserCard(User me, string cardId, string member)
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

                var UserCard = db.UserCards.FirstOrDefault(x => x.Card.Id == cardId && x.User.Id == member);
                if (UserCard == null) return Json(JsonConvert.SerializeObject(new { type = "error", msg = "${notExistUserinCard}" }, Tools.settings));

                try
                {
                    db.UserCards.Remove(UserCard);
                    db.SaveChanges();

                    return Json(JsonConvert.SerializeObject(new { type = "success", msg = "${SuccessDeleteUserCard}" }, Tools.settings));
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
