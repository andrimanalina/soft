using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SoftTrello.Migrations
{
    public partial class userBoardRole : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_UserBoards_BoardRoles_RoleId",
                table: "UserBoards");

            migrationBuilder.RenameColumn(
                name: "RoleId",
                table: "UserBoards",
                newName: "BoardRoleId");

            migrationBuilder.RenameIndex(
                name: "IX_UserBoards_RoleId",
                table: "UserBoards",
                newName: "IX_UserBoards_BoardRoleId");

            migrationBuilder.AddColumn<int>(
                name: "Role",
                table: "UserBoards",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddForeignKey(
                name: "FK_UserBoards_BoardRoles_BoardRoleId",
                table: "UserBoards",
                column: "BoardRoleId",
                principalTable: "BoardRoles",
                principalColumn: "Id");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_UserBoards_BoardRoles_BoardRoleId",
                table: "UserBoards");

            migrationBuilder.DropColumn(
                name: "Role",
                table: "UserBoards");

            migrationBuilder.RenameColumn(
                name: "BoardRoleId",
                table: "UserBoards",
                newName: "RoleId");

            migrationBuilder.RenameIndex(
                name: "IX_UserBoards_BoardRoleId",
                table: "UserBoards",
                newName: "IX_UserBoards_RoleId");

            migrationBuilder.AddForeignKey(
                name: "FK_UserBoards_BoardRoles_RoleId",
                table: "UserBoards",
                column: "RoleId",
                principalTable: "BoardRoles",
                principalColumn: "Id");
        }
    }
}
