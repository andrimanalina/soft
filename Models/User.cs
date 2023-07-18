using SoftTrello.Utils;
using System.ComponentModel.DataAnnotations;

namespace SoftTrello.Models
{
    public class User
    {
        [Key]
        public string Id { get; set; }
        public string Mail { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string PvtKey { get; set; } = string.Empty;
        public bool isNew { get; set; }


        public virtual List<UserRole> UserRoles { get; set; }
        public virtual List<UserWorkspace> UserWorkspaces { get; set; }
        public virtual List<UserBoard> UserBoards { get; set; }
        public virtual List<UserCard> UserCards { get; set; }
        public virtual List<UserCheckList> UserCheckLists { get; set; }
    }
}
