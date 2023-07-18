using System.ComponentModel.DataAnnotations;

namespace SoftTrello.Models
{
    public class Workspace
    {
        [Key]
        public string Id { get; set; } = String.Empty;
        public string Name { get; set; } = string.Empty;
        public string? Abrev { get; set; }
        public string? Type{ get; set; }
        public string? Description{ get; set; }
        public string? WebSite{ get; set; }
        public string Background { get; set; }
        public bool isPublic { get; set; }
        public DateTime DateCreated { get; set; } = DateTime.Now;


        public virtual List<Board> Boards { get; set; } = new List<Board>();
        public virtual List<UserWorkspace> UsersWorkspaces { get; set; } = new List<UserWorkspace>();
    }
}
