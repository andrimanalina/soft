using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SoftTrello.Migrations
{
    public partial class comss : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Id",
                table: "Comments",
                newName: "IdComs");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "IdComs",
                table: "Comments",
                newName: "Id");
        }
    }
}
