using System.ComponentModel.DataAnnotations;

namespace SoftTrello.Models
{
    public class UserCheckList
    {
        [Key]
        public string Id { get; set; } = string.Empty;
        public DateTime Date { get; set; }


        public virtual User User { get; set; } = new User();
        public virtual CheckList CheckList { get; set; } = new CheckList();
    }
}
