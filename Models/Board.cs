using System.ComponentModel.DataAnnotations;

namespace SoftTrello.Models
{
    public enum BVisibility
    {
        Private, Public, Workspace 
    }
    public class Board
    {
        [Key]
        public string Id { get; set; } = String.Empty;
        public string Name { get; set; } = "Name";
        public string Background { get; set; } = "#2892B8";
        public bool Archive { get; set; } = false;
        public BVisibility Visibility { get; set; } = BVisibility.Private;
        public DateTime DateCreated { get; set; } = DateTime.Now;

        
        public virtual Workspace Workspace { get; set; }

        
        public virtual List<State> States { get; set; }
        public virtual List<UserBoard> UserBoards { get; set; }
        public virtual List<Chat> Chats { get; set; }
        public virtual List<Activity> Activities { get; set; }
    }
}
