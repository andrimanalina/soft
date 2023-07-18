using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Newtonsoft.Json;
using SoftTrello.Context;
using SoftTrello.Models;
using SoftTrello.Utils;

namespace SoftTrello.Controllers
{
    public class StateController : Controller
    {

        private readonly dbContext db;
        private IConfiguration ConfigRoot;
        private readonly IHubContext<SignalRServer> signalrHub;


        public StateController(IConfiguration config, dbContext _db, IHubContext<SignalRServer> _signalrHub)
        {
            db = _db;
            ConfigRoot = config;
            signalrHub = _signalrHub;
        }


        #region get

        [HttpPost]
        public JsonResult GetState(User me, string boardId)
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
                var board = db.Boards.Where(x => x.Id == boardId).Select(x => new
                {
                    Id = x.Id,
                    Name = x.Name,
                    Visibility = x.Visibility,
                    isFavoris = x.UserBoards.Where(y => y.User.Mail == me.Mail && y.Board.Id == boardId).Select(y => y.isFavoris).SingleOrDefault(),
                    Role = x.UserBoards.Where(y => y.User.Mail == me.Mail && y.Board.Id == boardId).Select(y=>y.Role.ToString()).SingleOrDefault(),
                    States = x.States.Select(y => new
                    {
                        Id = y.Id,
                        Name = y.Name,
                        Position = y.Position,
                        Status = y.Status,
                        Cards = y.Cards.Select(c => new
                        {
                            Id = c.Id,
                            Name = c.Name,
                            Position = c.Position,
                            Date = c.StartDate != null || c.EndDate != null,
                            Description = !String.IsNullOrEmpty(c.Description),
                            Comments = c.Comments.Count(),
                            Member = c.UserCards.Count(),
                        }).OrderBy(c=>c.Position).ToList(),
                    }).OrderBy(x => x.Position).ToList()
                }).FirstOrDefault();

                return Json(JsonConvert.SerializeObject(new { type = "success", msg = "${successListCards}", data = board }, Tools.settings));
            }
            catch (Exception e)
            {
                return Json(JsonConvert.SerializeObject(new { type = "error", msg = e.Message }, Tools.settings));
            }
        }
        [HttpPost]
        public JsonResult Get(User me, string board)
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
                var states = db.States.Where(x => x.Board.Id == board).Select(x => new
                {
                    Id = x.Id,
                    Name = x.Name,
                    Position = x.Position,
                    Cards = x.Cards
                }).OrderBy(x => x.Position).ToList();

                return Json(JsonConvert.SerializeObject(new { type = "success", msg = "${successListCards}", data = states }, Tools.settings));
            }
            catch (Exception e)
            {
                return Json(JsonConvert.SerializeObject(new { type = "error", msg = e.Message }, Tools.settings));
            }
        }
        #endregion

        #region create
        [HttpPost]
        public JsonResult Create(User me, string stateName, int position, string boardId)
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

                var board = db.Boards.SingleOrDefault(x => x.Id == boardId);
                if (board == null) return Json(JsonConvert.SerializeObject(new { type = "error", msg = "${notExistBoard}" }, Tools.settings));

                if (db.States.Any(x => x.Name == stateName && x.Board.Id == board.Id)) return Json(JsonConvert.SerializeObject(new { type = "error", msg = "${ExistState}" }, Tools.settings));


                //Create new State
                var state = new State()
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = stateName,
                    Board = board,
                    Position = position,
                };

                try
                {
                    db.States.Add(state);

                    db.SaveChanges();

                    return Json(JsonConvert.SerializeObject(new { type = "success", msg = "${SuccessAddState}", data = state.Id }, Tools.settings));
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
        public JsonResult Delete(User me, string stateId)
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

                var state = db.States.SingleOrDefault(x => x.Id == stateId);
                if (state == null) return Json(JsonConvert.SerializeObject(new { type = "error", msg = "${notExistState}" }, Tools.settings));


                try
                {
                    //get all Cards

                    //var cards = db.Cards.Where(x => x.State.Id == state.Id).ToList();

                    db.States.Remove(state);

                    db.SaveChanges();

                    return Json(JsonConvert.SerializeObject(new { type = "success", msg = "${SuccessDeleteState}", data = state.Name }, Tools.settings));
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
        public JsonResult Update(User me, string stateId, string stateName)
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

                var state = db.States.FirstOrDefault(x => x.Id == stateId);
                if (state == null) return Json(JsonConvert.SerializeObject(new { type = "error", msg = "${notExistState}" }, Tools.settings));

                try
                {
                    state.Name = stateName;

                    db.States.Update(state);
                    db.SaveChanges();

                    return Json(JsonConvert.SerializeObject(new { type = "success", msg = "${SuccessUpdateState}" }, Tools.settings));
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
        public JsonResult UpdatePosition(User me, string boardId, int statePos, string stateId)
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
                var updatedState = db.States.FirstOrDefault(x => x.Id == stateId);
                if (updatedState == null) return Json(JsonConvert.SerializeObject(new { type = "error", msg = "${notExistState}" }, Tools.settings));


                var board = db.Boards.Where(y => y.States.Any(x => x.Id == updatedState.Id)).FirstOrDefault();

                try
                {
                    board = db.Boards.Where(x => x.Id == boardId).FirstOrDefault();
                    if (board == null) return Json(JsonConvert.SerializeObject(new { type = "error", msg = "${notExistBoard}" }, Tools.settings));

                    //update the moving Card
                    updatedState.Position = statePos;

                    db.States.Update(updatedState);

                    db.SaveChanges();

                    //get all card that position is > moving card Position
                    var stats = db.States.Where(x => x.Board.Id == boardId && x.Id != updatedState.Id).OrderBy(x => x.Position).ToList();

                    int i = 0;
                    foreach (var item in stats)
                    {
                        if (item.Position == statePos) i++;
                        i++;
                        item.Position = i;
                        db.States.Update(item);
                    }

                    db.SaveChanges();

                    return Json(JsonConvert.SerializeObject(new { type = "success", msg = "${SuccessUpdateStatePosition}", data = "" }, Tools.settings));
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
