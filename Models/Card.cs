using System.ComponentModel.DataAnnotations;

namespace SoftTrello.Models
{
    public class Card
    {
        [Key]
        public string Id { get; set; } = String.Empty;
        public string Name { get; set; } = "New Card";
        public string? Description { get; set; }
        public Nullable<DateTime> StartDate  { get; set; }
        public Nullable<DateTime> EndDate  { get; set; }
        public int Position { get; set; } = 0;
        public bool isFinished { get; set; }

        public virtual State State{ get; set; }


        public virtual List<Etiquette> Etiquettes { get; set; }
        public virtual List<CheckList> CheckLists { get; set; }
        public virtual List<Comment> Comments { get; set; }
        public virtual List<UserCard> UserCards { get; set; }
    }
}
