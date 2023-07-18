using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SoftTrello.Migrations
{
    public partial class addLastVisite : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_UserWorkspaces_Workspaces_WorkspaceId",
                table: "UserWorkspaces");

            migrationBuilder.AlterColumn<string>(
                name: "WorkspaceId",
                table: "UserWorkspaces",
                type: "nvarchar(450)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(450)",
                oldNullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastOpen",
                table: "UserWorkspaces",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddForeignKey(
                name: "FK_UserWorkspaces_Workspaces_WorkspaceId",
                table: "UserWorkspaces",
                column: "WorkspaceId",
                principalTable: "Workspaces",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_UserWorkspaces_Workspaces_WorkspaceId",
                table: "UserWorkspaces");

            migrationBuilder.DropColumn(
                name: "LastOpen",
                table: "UserWorkspaces");

            migrationBuilder.AlterColumn<string>(
                name: "WorkspaceId",
                table: "UserWorkspaces",
                type: "nvarchar(450)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)");

            migrationBuilder.AddForeignKey(
                name: "FK_UserWorkspaces_Workspaces_WorkspaceId",
                table: "UserWorkspaces",
                column: "WorkspaceId",
                principalTable: "Workspaces",
                principalColumn: "Id");
        }
    }
}
