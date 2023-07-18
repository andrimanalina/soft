using System.ComponentModel.DataAnnotations;

namespace SoftTrello.Models
{
    public class Chat
    {
        [Key]
        public string Id { get; set; } = String.Empty;
        public string Message { get; set; } = String.Empty;
        public DateTime Date { get; set; } = DateTime.Now;


        public virtual User User { get; set; } = new User();
        public virtual Board Board { get; set; } = new Board();
    }
}
