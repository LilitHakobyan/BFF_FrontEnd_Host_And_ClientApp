using Duende.Bff;
using Duende.Bff.Yarp;
using Yarp.ReverseProxy.Configuration;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors();

builder.Services.AddBff(options =>
    {
        // default value
        //  options.ManagementBasePath = "/bff";
    })
    // .AddRemoteApis() //enable remote apis
    .AddServerSideSessions();

builder.Services.AddReverseProxy()
    .AddBffExtensions()
    .LoadFromMemory(
        new[]
        {
            new RouteConfig
            {
                RouteId = "credentials",
                ClusterId = "cluster1",

                Match = new RouteMatch
                {
                    Path = "/credentials/{**catch-all}"
                }
            }.WithAccessToken(TokenType.User),
        },
        new[]
        {
            new ClusterConfig
            {
                ClusterId = "cluster1",

                Destinations = new Dictionary<string, DestinationConfig>(StringComparer.OrdinalIgnoreCase)
                {
                    {"destination1", new DestinationConfig() {Address = "https://localhost:781/api"}}
                }
            }
        });
//.LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"));


builder.Services.AddAuthentication(options =>
{
    options.DefaultScheme = "cookie";
    options.DefaultChallengeScheme = "oidc";
    options.DefaultSignOutScheme = "oidc";
})
.AddCookie("cookie", options =>
{
    options.Cookie.Name = "__Host-bff";
    options.Cookie.SameSite = SameSiteMode.Lax;
})
.AddOpenIdConnect("oidc", options =>
{
    options.Authority = "https://localhost:901";
    options.ClientId = "clientid";

    //  options.ClientSecret = "secret";
    options.ResponseType = "code";
    options.ResponseMode = "query";
    options.GetClaimsFromUserInfoEndpoint = true;
    options.MapInboundClaims = false;
    options.SaveTokens = true;
    options.Scope.Clear();
    options.Scope.Add("openid");
    options.Scope.Add("profile");
    // options.Scope.Add("api");
    options.Scope.Add("offline_access");
    options.TokenValidationParameters = new()
    {
        NameClaimType = "name",
        RoleClaimType = "role"
    };
});

var app = builder.Build();

app.UseCors(x => x.AllowAnyHeader().AllowAnyMethod().AllowAnyOrigin());

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseForwardedHeaders();
app.UseStaticFiles();
app.UseRouting();

app.UseAuthentication();
app.UseBff();
app.UseAuthorization();

app.UseEndpoints(endpoints =>
{
    // login, logout, user, backchannel logout...
    endpoints.MapBffManagementEndpoints();


    //// if you want the cred API remote
    endpoints.MapBffReverseProxy();

    // reverse proxy configuration
    //endpoints.MapRemoteBffApiEndpoint("/cred", "https://localhost:781/api/credentials").RequireAccessToken(TokenType.User);
});


app.Run();
