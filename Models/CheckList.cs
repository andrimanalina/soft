using System.ComponentModel.DataAnnotations;

namespace SoftTrello.Models
{
    public class CheckList
    {
        [Key]
        public string Id { get; set; } = String.Empty;
        public string Name { get; set; } = "new CheckList";
        public Nullable<DateTime> StartDate { get; set; }
        public Nullable<DateTime> EndDate { get; set; }
        public bool isFinished { get; set; } = false;
        public int Position { get; set; }


        public virtual Card Card { get; set; } = new Card();
        
        
        public virtual List<UserCheckList> UserCheckLists { get; set; } = new List<UserCheckList>();
    }
}
