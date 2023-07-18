using System.ComponentModel.DataAnnotations;

namespace SoftTrello.Models
{
    public class Comment
    {
        [Key]
        public string Id { get; set; } = String.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime Date { get; set; } = DateTime.Now;

        
        public virtual User User { get; set; } = new User();
        public virtual Card Card{ get; set; } = new Card();

    }
}
