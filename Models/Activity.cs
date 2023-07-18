using System.ComponentModel.DataAnnotations;

namespace SoftTrello.Models
{
    public class Activity
    {
        [Key]
        public string Id { get; set; } = string.Empty;
        public string Detail { get; set; }
        public DateTime Date { get; set; } = DateTime.Now;


        public virtual Board Board { get; set; } = new Board();
    }
}
