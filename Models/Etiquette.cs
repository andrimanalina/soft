using System.ComponentModel.DataAnnotations;

namespace SoftTrello.Models
{
    public class Etiquette
    {
        [Key]
        public string Id { get; set; } = String.Empty;
        public string Name { get; set; } = string.Empty;
        public string Background { get; set; } = "#2892B8";


        public virtual Card Card { get; set; } = new Card();
    }
}
