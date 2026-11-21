var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllersWithViews();

var app = builder.Build();
app.MapStaticAssets();
app.MapControllerRoute("default", "{controller=Home}/{action=Index}").WithStaticAssets();
app.Run();
