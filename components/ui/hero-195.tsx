"use client"

import * as React from "react"
import { BarChart2, TrendingUp, RefreshCw, ShoppingCart, Percent, ShieldCheck } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./tabs"
import { BorderBeam } from "./border-beam"
import { TracingBeam } from "./tracing-beam"

export interface ClickData {
  amazon: number
  walmart: number
  flipkart: number
  snapdeal: number
}

export const Hero195 = () => {
  const [clicks, setClicks] = React.useState<ClickData>({
    amazon: 12,
    walmart: 8,
    flipkart: 15,
    snapdeal: 5,
  })

  const [loading, setLoading] = React.useState(false)

  const handleReset = () => {
    setLoading(true)
    setTimeout(() => {
      setClicks({
        amazon: 0,
        walmart: 0,
        flipkart: 0,
        snapdeal: 0,
      })
      setLoading(false)
    }, 600)
  }

  const handleSimulate = (platform: keyof ClickData) => {
    setClicks(prev => ({
      ...prev,
      [platform]: prev[platform] + 1,
    }))
  }

  const totalClicks = clicks.amazon + clicks.walmart + clicks.flipkart + clicks.snapdeal
  const maxClicks = Math.max(clicks.amazon, clicks.walmart, clicks.flipkart, clicks.snapdeal, 1)

  const platforms = [
    { id: "amazon" as const, name: "Amazon", color: "from-amber-400 to-orange-500", text: "text-amber-500", bg: "bg-amber-500/10" },
    { id: "walmart" as const, name: "Walmart", color: "from-blue-400 to-indigo-500", text: "text-blue-500", bg: "bg-blue-500/10" },
    { id: "flipkart" as const, name: "Flipkart", color: "from-yellow-400 to-amber-500", text: "text-yellow-500", bg: "bg-yellow-500/10" },
    { id: "snapdeal" as const, name: "Snapdeal", color: "from-red-400 to-rose-500", text: "text-red-500", bg: "bg-red-500/10" },
  ]

  const sortedPlatforms = [...platforms].sort((a, b) => clicks[b.id] - clicks[a.id])
  const primaryPlatform = sortedPlatforms[0]

  return (
    <TracingBeam className="py-8 px-4 max-w-5xl">
      <div className="space-y-8">
        {/* Title Block */}
        <div className="flex flex-col space-y-2 text-center md:text-left">
          <div className="inline-flex items-center space-x-2 bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase self-center md:self-start border border-indigo-500/20">
            <BarChart2 className="w-3.5 h-3.5 mr-1 animate-pulse" />
            User Insights & Analytics
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
            Marketplace Navigation Analysis
          </h2>
          <p className="text-muted-foreground max-w-2xl text-sm md:text-base">
            Track and visualize which e-commerce platform receives the highest volume of user navigations, clicks, and checkout redirection.
          </p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Main Visual SVG Graph Card */}
          <Card className="col-span-1 md:col-span-2 bg-neutral-900/50 border-neutral-800 backdrop-blur-xl relative overflow-hidden">
            <BorderBeam size={400} duration={12} borderWidth={1.5} colorFrom="#6366f1" colorTo="#a855f7" />
            
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl text-white">Redirection Flow Volume</CardTitle>
                <CardDescription className="text-neutral-400">Live navigation count per company</CardDescription>
              </div>
              <button
                onClick={handleReset}
                disabled={loading}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 text-neutral-300 hover:bg-neutral-700 active:scale-95 transition-all text-xs font-semibold border border-neutral-700/50 disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                <span>Reset Stats</span>
              </button>
            </CardHeader>

            <CardContent className="h-64 flex flex-col justify-end space-y-4 pt-4">
              {/* Dynamic SVG / Div Bar Chart */}
              <div className="flex items-end justify-between h-48 px-2 md:px-6 relative border-b border-neutral-800/80 pb-2">
                
                {/* Horizontal Grid lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none select-none pr-2">
                  <div className="border-t border-neutral-800/40 w-full text-[10px] text-neutral-600 pt-1 text-right">100%</div>
                  <div className="border-t border-neutral-800/40 w-full text-[10px] text-neutral-600 pt-1 text-right">50%</div>
                  <div className="border-t border-neutral-800/40 w-full text-[10px] text-neutral-600 pt-1 text-right">0%</div>
                </div>

                {platforms.map(p => {
                  const clickCount = clicks[p.id]
                  const percentage = totalClicks > 0 ? (clickCount / totalClicks) * 100 : 0
                  const heightPercent = (clickCount / maxClicks) * 100

                  return (
                    <div key={p.id} className="flex flex-col items-center flex-1 z-10 group cursor-pointer">
                      <div className="relative w-12 md:w-16 flex items-end justify-center h-40">
                        {/* Tooltip */}
                        <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-neutral-950 text-white border border-neutral-800 text-[10px] rounded px-2 py-1 shadow-xl pointer-events-none z-50 text-center">
                          <p className="font-bold">{clickCount} Clicks</p>
                          <p className="text-neutral-400">{percentage.toFixed(1)}% ratio</p>
                        </div>
                        
                        {/* Dynamic HSL Animated Gradient Bar */}
                        <div
                          style={{ height: `${Math.max(heightPercent, 5)}%` }}
                          className={`w-8 md:w-10 rounded-t-lg bg-gradient-to-t ${p.color} transition-all duration-700 ease-out shadow-lg shadow-indigo-500/5 group-hover:scale-x-105 relative overflow-hidden`}
                        >
                          {/* Inner shine */}
                          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-neutral-400 mt-2.5 group-hover:text-white transition-colors">
                        {p.name}
                      </span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Quick Analytics Metrics Card */}
          <Card className="bg-neutral-900/50 border-neutral-800 backdrop-blur-xl flex flex-col justify-between">
            <CardHeader>
              <CardTitle className="text-xl text-white">Dominance Index</CardTitle>
              <CardDescription className="text-neutral-400">Redirection metrics breakdown</CardDescription>
            </CardHeader>

            <CardContent className="space-y-5">
              {/* Leader Metric */}
              <div className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800/80 flex items-center space-x-4">
                <div className={`p-3 rounded-lg ${totalClicks > 0 ? primaryPlatform.bg : 'bg-neutral-800'} ${totalClicks > 0 ? primaryPlatform.text : 'text-neutral-500'}`}>
                  <TrendingUp className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <p className="text-[11px] text-neutral-400 font-bold uppercase tracking-wider">Top Redirection</p>
                  <h4 className="text-lg font-extrabold text-white">
                    {totalClicks > 0 ? primaryPlatform.name : "None"}
                  </h4>
                  <p className="text-xs text-neutral-500">
                    {totalClicks > 0
                      ? `${((clicks[primaryPlatform.id] / totalClicks) * 100).toFixed(0)}% of total navigation`
                      : "No navigation data logged"}
                  </p>
                </div>
              </div>

              {/* Total volume indicator */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-neutral-950/40 border border-neutral-800/50 rounded-lg text-center">
                  <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider block">Total Redirects</span>
                  <span className="text-2xl font-black text-white">{totalClicks}</span>
                </div>
                <div className="p-3 bg-neutral-950/40 border border-neutral-800/50 rounded-lg text-center">
                  <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider block">Avg Redirection</span>
                  <span className="text-2xl font-black text-white">{(totalClicks / 4).toFixed(1)}</span>
                </div>
              </div>
            </CardContent>

            <CardFooter className="pt-2 border-t border-neutral-800/30">
              <div className="flex items-center space-x-2 text-[11px] text-neutral-400">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                <span>Cookies & LocalStorage persistent active</span>
              </div>
            </CardFooter>
          </Card>

        </div>

        {/* Tabs for simulating navigation & viewing list ratios */}
        <div className="bg-neutral-900/40 border border-neutral-800/80 rounded-xl p-6 backdrop-blur-md">
          <Tabs defaultValue="ratio" className="w-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 mb-4 border-b border-neutral-800/60 gap-4">
              <h3 className="text-lg font-bold text-white flex items-center">
                <ShoppingCart className="w-4 h-4 mr-2 text-indigo-400" />
                Interactive Redirections Analyzer
              </h3>
              <TabsList className="bg-neutral-950 border border-neutral-800 p-1">
                <TabsTrigger value="ratio" className="text-neutral-400 data-[state=active]:bg-indigo-600 data-[state=active]:text-white">Redirection Ratio</TabsTrigger>
                <TabsTrigger value="simulate" className="text-neutral-400 data-[state=active]:bg-indigo-600 data-[state=active]:text-white">Simulate Redirections</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="ratio" className="space-y-4 focus-visible:ring-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {platforms.map(p => {
                  const clickCount = clicks[p.id]
                  const percentage = totalClicks > 0 ? (clickCount / totalClicks) * 100 : 0
                  return (
                    <div key={p.id} className="p-3 bg-neutral-950/50 border border-neutral-900 rounded-lg flex flex-col justify-between space-y-2">
                      <div className="flex justify-between items-center text-xs font-semibold">
                        <span className="text-white flex items-center">
                          <span className={`w-2 h-2 rounded-full bg-gradient-to-tr ${p.color} mr-2`} />
                          {p.name} Redirections
                        </span>
                        <span className="text-neutral-400">{clickCount} clicks ({percentage.toFixed(0)}%)</span>
                      </div>
                      {/* Bar indicator */}
                      <div className="w-full h-1.5 bg-neutral-900 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${percentage}%` }}
                          className={`h-full bg-gradient-to-r ${p.color} transition-all duration-500`}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </TabsContent>

            <TabsContent value="simulate" className="focus-visible:ring-0">
              <div className="p-4 bg-neutral-950/60 border border-neutral-800 rounded-lg text-center mb-4">
                <p className="text-xs text-neutral-400">
                  Simulate navigating to a platform marketplace from our search result list to check live updates to the analysis graph above!
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {platforms.map(p => (
                  <button
                    key={p.id}
                    onClick={() => handleSimulate(p.id)}
                    className="p-3 rounded-lg border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 active:scale-95 text-white transition-all text-xs font-bold text-center flex flex-col items-center gap-2 group"
                  >
                    <span className={`p-2 rounded-full ${p.bg} ${p.text} group-hover:scale-110 transition-transform`}>
                      <ShoppingCart className="w-4 h-4" />
                    </span>
                    <span>Click {p.name} Link</span>
                  </button>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </TracingBeam>
  )
}
