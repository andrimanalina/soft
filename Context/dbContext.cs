using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using SoftTrello.Models;
using System.Diagnostics;
using System.Reflection.Metadata;
using System.Security.Cryptography.X509Certificates;
using Activity = SoftTrello.Models.Activity;

namespace SoftTrello.Context
{
    //public class dbContextFactory : IDesignTimeDbContextFactory<dbContext>
    //{
    //    public dbContext CreateDbContext(string[] args)
    //    {
    //        var optionsBuilder = new DbContextOptionsBuilder<dbContext>();
    //        optionsBuilder.UseSqlServer(WebApplication.CreateBuilder(args).Configuration.GetConnectionString("dbContext"));

    //        return new dbContext(optionsBuilder.Options);
    //    }
    //}
    public class dbContext : DbContext
    {
        public dbContext(DbContextOptions<dbContext> options) : base(options){ }

        public DbSet<Activity> Activities{ get; set; }
        public DbSet<Board> Boards{ get; set; }
        public DbSet<Card> Cards{ get; set; }
        public DbSet<Chat> Chats{ get; set; }
        public DbSet<CheckList> CheckLists{ get; set; }
        public DbSet<Comment> Comments { get; set; }
        public DbSet<Etiquette> Etiquettes{ get; set; }
        public DbSet<Role> Roles{ get; set; }
        public DbSet<BoardRole> BoardRoles{ get; set; }
        public DbSet<WorkspaceRole> WorkspaceRoles{ get; set; }
        public DbSet<State> States{ get; set; }
        public DbSet<User> Users{ get; set; }
        public DbSet<UserBoard> UserBoards{ get; set; }
        public DbSet<UserCard> UserCards{ get; set; }
        public DbSet<UserCheckList> UserCheckLists { get; set; }
        public DbSet<UserRole> UserRoles{ get; set; }
        public DbSet<UserWorkspace> UserWorkspaces{ get; set; }
        public DbSet<Workspace> Workspaces{ get; set; }


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder
            .Entity<Workspace>()
            .HasMany(e => e.Boards)
            .WithOne(x => x.Workspace)
            .OnDelete(DeleteBehavior.Cascade);

            modelBuilder
            .Entity<Workspace>()
            .HasMany(e => e.UsersWorkspaces)
            .WithOne(x => x.Workspace)
            .OnDelete(DeleteBehavior.Cascade);

            modelBuilder
            .Entity<Board>()
            .HasMany(e => e.States)
            .WithOne(x => x.Board)
            .OnDelete(DeleteBehavior.Cascade);

            modelBuilder
            .Entity<State>()
            .HasMany(e => e.Cards)
            .WithOne(x=>x.State)
            .OnDelete(DeleteBehavior.Cascade);

            modelBuilder
            .Entity<Card>()
            .HasMany(e => e.Etiquettes)
            .WithOne(x => x.Card)
            .OnDelete(DeleteBehavior.Cascade);

        }
    }
}
