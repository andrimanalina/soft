using System.ComponentModel.DataAnnotations;

namespace SoftTrello.Models
{
    public enum URole
    {
        User, Client, Admin, Controller
    }

    public enum USRole
    {
        Client, Developper, Tech, Controller, Member
    }

    public enum BRole
    {
        Admin, Reader, Writer 
    }

    public enum RAction
    {
        All, Reader, Writer
    }

    public class Role
    {
        [Key]
        public string Id { get; set; }
        public string Name { get; set; } = string.Empty;
        //public bool isAdmin { get; set; }
        //[EnumDataType(typeof(RAction))]
        //public RAction RAction { get; set; }

        public virtual List<UserRole> UserRoles { get; set; } = new List<UserRole>();
    }

    public class BoardRole
    {
        [Key]
        public string Id { get; set; } 
        public string Name { get; set; } = string.Empty;


        public virtual List<UserBoard> UserBoardRoles { get; set; } = new List<UserBoard>();
    }

    public class WorkspaceRole
    {
        [Key]
        public string Id { get; set; }
        public string Name { get; set; } = string.Empty;


        public virtual List<UserWorkspace> UserWorkspaceRoles { get; set; } = new List<UserWorkspace>();
    }
}
