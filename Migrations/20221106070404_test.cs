using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SoftTrello.Migrations
{
    public partial class test : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Title",
                table: "States",
                newName: "Name");

            migrationBuilder.RenameColumn(
                name: "Title",
                table: "Boards",
                newName: "Name");

            migrationBuilder.AddColumn<int>(
                name: "Visibility",
                table: "Boards",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Visibility",
                table: "Boards");

            migrationBuilder.RenameColumn(
                name: "Name",
                table: "States",
                newName: "Title");

            migrationBuilder.RenameColumn(
                name: "Name",
                table: "Boards",
                newName: "Title");
        }
    }
}
