using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SoftTrello.Migrations
{
    public partial class addisFinishedCard : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "isFinished",
                table: "Cards",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "isFinished",
                table: "Cards");
        }
    }
}
