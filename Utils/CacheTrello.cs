using SoftTrello.Context;
using SoftTrello.Models;

namespace SoftTrello.Utils
{
    public static class CacheTrello
    {
        public static bool first = false;
        public static string test = "";
        //Role
        public static Dictionary<string, Role> DRoles = new Dictionary<string, Role>();
        public static Dictionary<string, BoardRole> DBoardRoles = new Dictionary<string, BoardRole>();
        public static Dictionary<string, WorkspaceRole> DWorkspaceRoles = new Dictionary<string, WorkspaceRole>();

        //User
        public static Dictionary<string, User> DUsers = new Dictionary<string, User>();
        public static Dictionary<string, UserRole> DUserRoles = new Dictionary<string, UserRole>();
        public static Dictionary<string, UserWorkspace> DUserWorkspaces = new Dictionary<string, UserWorkspace>();
        public static Dictionary<string, UserBoard> DUserBoards = new Dictionary<string, UserBoard>();
        public static Dictionary<string, UserCard> DUserCards = new Dictionary<string, UserCard>();
        public static Dictionary<string, UserCheckList> DUserCheckLists = new Dictionary<string, UserCheckList>();

        //WorkSpace
        public static Dictionary<string, Workspace> DWorkspaces = new Dictionary<string, Workspace>();

        //Board
        public static Dictionary<string, Board> DBoards = new Dictionary<string, Board>();
        public static Dictionary<string, Activity> DActivities = new Dictionary<string, Activity>();
        public static Dictionary<string, Chat> DChats = new Dictionary<string, Chat>();

        //State
        public static Dictionary<string, State> DStates = new Dictionary<string, State>();

        //Card
        public static Dictionary<string, Card> DCards = new Dictionary<string, Card>();
        public static Dictionary<string, Etiquette> DEtiquettes = new Dictionary<string, Etiquette>();
        public static Dictionary<string, CheckList> DCheckLists = new Dictionary<string, CheckList>();
        public static Dictionary<string, Comment> DComments = new Dictionary<string, Comment>();

        //InitDB
        public static void InitDb(dbContext db)
        {
            //Role
            DRoles = db.Roles.ToDictionary(x=>x.Id);
            DBoardRoles = db.BoardRoles.ToDictionary(x => x.Id);
            DWorkspaceRoles = db.WorkspaceRoles.ToDictionary(x => x.Id);

            //User
            DUsers = db.Users.ToDictionary(x => x.Mail);
            DUserRoles = db.UserRoles.ToDictionary(x => x.Id);
            DUserWorkspaces = db.UserWorkspaces.ToDictionary(x => x.Id);
            DUserBoards = db.UserBoards.ToDictionary(x => x.Id);
            DUserCards = db.UserCards.ToDictionary(x => x.Id);
            DUserCheckLists = db.UserCheckLists.ToDictionary(x => x.Id);

            //Workspace
            DWorkspaces = db.Workspaces.ToDictionary(x => x.Name);

            //Board
            //DBoards = db.Boards.ToDictionary(x => x.Name);
            DActivities = db.Activities.ToDictionary(x => x.Id);
            DChats = db.Chats.ToDictionary(x => x.Id);

            //State
            DStates = db.States.ToDictionary(x => x.Id);
            
            //Card
            DCards = db.Cards.ToDictionary(x => x.Id);
            DEtiquettes = db.Etiquettes.ToDictionary(x => x.Id);
            DCheckLists = db.CheckLists.ToDictionary(x => x.Id);
            DComments = db.Comments.ToDictionary(x => x.Id);
        }
    }
}
