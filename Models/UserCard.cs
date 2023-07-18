using System.ComponentModel.DataAnnotations;

namespace SoftTrello.Models
{
    public class UserCard
    {
        [Key]
        public string Id { get; set; } = string.Empty;
        public DateTime Date { get; set; }


        public virtual User User { get; set; } = new User();
        public virtual Card Card { get; set; } = new Card(); 
    }
}
