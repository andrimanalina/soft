using System.ComponentModel.DataAnnotations;

namespace SoftTrello.Models
{

    public enum SStatus
    {
        Nothing, Started, InProgress, Terminated, Canceled
    }

    public class State
    {
        [Key]
        public string Id { get; set; } = String.Empty;
        public string Name { get; set; } = string.Empty;
        public int Position { get; set; } = 0;
        public SStatus Status { get; set; } = SStatus.Nothing;

        public virtual Board Board { get; set; }
        
        
        public virtual List<Card> Cards{ get; set; }

    }
}
