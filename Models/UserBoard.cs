using System.ComponentModel.DataAnnotations;

namespace SoftTrello.Models
{
    public class UserBoard
    {
        [Key]
        public string Id { get; set; }
        public DateTime Date { get; set; }
        public bool isFavoris { get; set; }


        public virtual User User { get; set; }
        public virtual Board Board { get; set; }
        public virtual UserBoardRole Role { get; set; } = UserBoardRole.Membre;
    }

    public enum UserBoardRole
    {
        Membre, Développeur, Client, Tech, Observateur,
    }
}
