using Microsoft.EntityFrameworkCore;
using SoftTrello;
using SoftTrello.Context;
using SoftTrello.Utils;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllersWithViews();
builder.Services.AddDbContext<dbContext>(options =>
    {
        options.UseSqlServer(builder.Configuration.GetConnectionString("dbContext"),
        sqlServerOptionsAction: sqlOption =>
        {
            sqlOption.EnableRetryOnFailure(maxRetryCount: 10, maxRetryDelay: TimeSpan.FromSeconds(5), errorNumbersToAdd: null);
        });
        options.EnableSensitiveDataLogging();
    });
builder.Services.AddSignalR();


try
{
    CacheTrello.InitDb(new dbContext(new DbContextOptionsBuilder<dbContext>().UseSqlServer(builder.Configuration.GetConnectionString("dbContext")).Options));
}
catch (Exception e )
{
    CacheTrello.test = e.Message;
}

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseAuthorization();

app.MapHub<SignalRServer>("/signalrserver");
app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Authentication}/{action=Login}/{id?}");
   // pattern: "{controller=Workspace}/{action=Index}/{id?}");

app.Run();