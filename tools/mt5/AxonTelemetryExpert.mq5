//+------------------------------------------------------------------+
//| AxonTelemetryExpert.mq5                                        |
//| Sends device fingerprint + account context to Axon REST API.    |
//| MT5: Tools -> Options -> Expert Advisors -> allow WebRequest URL |
//+------------------------------------------------------------------+
#property copyright "Axon Funded"
#property version   "1.00"
#property strict

input string AxonSiteBase          = "https://your-domain.com";
input string AxonTelemetrySecret    = "";
input string AxonTraderRef         = "";
input int    HeartbeatSeconds      = 60;

ulong Djb2(const string s)
  {
   ulong h = 5381;
   const int n = StringLen(s);
   for(int i = 0; i < n; i++)
     {
      const int c = (int)StringGetCharacter(s, i);
      h = ((h << 5) + h) + (ulong)c;
     }
   return h;
  }

string EscapeJsonSimple(const string s)
  {
   string out = "";
   const int n = StringLen(s);
   for(int i = 0; i < n; i++)
     {
      const ushort ch = StringGetCharacter(s, i);
      if(ch == '"')
         out += "\\\"";
      else if(ch == '\\')
         out += "\\\\";
      else if(ch < 32)
         out += " ";
      else
         out += CharToString((uchar)ch);
     }
   return out;
  }

string BuildFingerprint()
  {
   const string path = TerminalInfoString(TERMINAL_PATH);
   const string srv  = AccountInfoString(ACCOUNT_SERVER);
   const long login  = (long)AccountInfoInteger(ACCOUNT_LOGIN);
   return StringFormat("mt5:%llu-%llu-%llu",
                       Djb2(path),
                       Djb2(srv),
                       (ulong)login);
  }

string AccountModeJson()
  {
   const ENUM_ACCOUNT_TRADE_MODE m =
      (ENUM_ACCOUNT_TRADE_MODE)AccountInfoInteger(ACCOUNT_TRADE_MODE);
   if(m == ACCOUNT_TRADE_MODE_DEMO)
      return "demo";
   if(m == ACCOUNT_TRADE_MODE_REAL)
      return "live";
   return "unknown";
  }

bool SendTelemetry(const string eventName)
  {
   if(StringLen(AxonSiteBase) < 8 || StringLen(AxonTelemetrySecret) < 8 || StringLen(AxonTraderRef) < 2)
     {
      Print("Axon: set AxonSiteBase, AxonTelemetrySecret, AxonTraderRef.");
      return false;
     }

   const string srv = AccountInfoString(ACCOUNT_SERVER);
   const string loginStr = IntegerToString(AccountInfoInteger(ACCOUNT_LOGIN));
   const string fp = BuildFingerprint();
   const string mode = AccountModeJson();
   const int build = (int)TerminalInfoInteger(TERMINAL_BUILD);

   const string body =
      "{" +
      "\"traderRef\":\"" + EscapeJsonSimple(AxonTraderRef) + "\"," +
      "\"mtLogin\":\"" + EscapeJsonSimple(loginStr) + "\"," +
      "\"server\":\"" + EscapeJsonSimple(srv) + "\"," +
      "\"fingerprint\":\"" + EscapeJsonSimple(fp) + "\"," +
      "\"event\":\"" + eventName + "\"," +
      "\"terminalBuild\":" + IntegerToString(build) + "," +
      "\"accountMode\":\"" + mode + "\"" +
      "}";

   uchar post[];
   StringToCharArray(body, post, 0, WHOLE_ARRAY, CP_UTF8);

   string headers = "Content-Type: application/json; charset=utf-8\r\n";
   headers += "Authorization: Bearer " + AxonTelemetrySecret + "\r\n";

   uchar result[];
   string result_headers;
   const string url = AxonSiteBase + "/api/mt/telemetry";

   ResetLastError();
   const int http = WebRequest("POST", url, headers, 10000, post, result, result_headers);
   if(http == -1)
     {
      Print("Axon WebRequest failed err=", GetLastError(), " add URL in MT5 options: ", url);
      return false;
     }

   Print("Axon telemetry ", eventName, " http=", http);
   return true;
  }

int OnInit()
  {
   if(HeartbeatSeconds < 10)
     {
      Print("Axon: HeartbeatSeconds must be >= 10");
      return INIT_FAILED;
     }
   EventSetTimer(HeartbeatSeconds);
   SendTelemetry("connect");
   return INIT_SUCCEEDED;
  }

void OnDeinit(const int reason)
  {
   EventKillTimer();
   SendTelemetry("disconnect");
  }

void OnTimer()
  {
   SendTelemetry("heartbeat");
  }
