using System.ComponentModel.DataAnnotations;

namespace SoftTrello.Models
{
    public class UserRole
    {
        [Key]
        public string Id { get; set; } = string.Empty;
        public DateTime Date { get; set; }


        public virtual User User { get; set; } = new User();
        public virtual Role Role { get; set; } = new Role();
    }
}
