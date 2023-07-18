using System.ComponentModel.DataAnnotations;

namespace SoftTrello.Models
{
    public class UserWorkspace
    {
        [Key]
        public string Id { get; set; } = string.Empty;
        public DateTime Date { get; set; } = DateTime.Now;
        public DateTime LastOpen { get; set; } = DateTime.Now;

        public virtual User User { get; set; } = new User();
        public virtual Workspace Workspace { get; set; } = new Workspace();
        public virtual WorkspaceRole? Role { get; set; } = new WorkspaceRole();
    }
}
