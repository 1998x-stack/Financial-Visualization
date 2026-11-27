import * as echarts from "echarts";
import { sankey, sankeyLinkHorizontal } from "d3-sankey";
import { select } from "d3-selection";
import report from "../demo/financials.json";

const {periods, series: s} = report;
const idx = periods.indexOf("2025");
if (idx < 0) throw new Error("Missing audited example period");
const annual = echarts.init(document.querySelector("#echarts"), null, {renderer:"svg"});
annual.setOption({
  animation: false,
  tooltip: {trigger:"axis"},
  legend: {top:0},
  grid: {left:65,right:20,top:50,bottom:50},
  xAxis: {type:"category",name:"FY",data:periods},
  yAxis: {type:"value",name:"亿元"},
  series: [
    {name:"营业收入",type:"bar",barMaxWidth:38,data:s.revenue,itemStyle:{color:"#265cbd"}},
    {name:"净利润",type:"line",data:s.net_profit,lineStyle:{color:"#088b85"},itemStyle:{color:"#088b85"}}
  ]
});
new ResizeObserver(()=>annual.resize()).observe(document.querySelector("#echarts"));

const amount = metric => s[metric][idx];
const gross = amount("gross_profit");
const costs = ["rd_expense","sales_expense","admin_expense","other_net_expense"];
const nearly = (a,b) => Math.abs(a-b)<0.001;
if (!nearly(amount("revenue")-amount("cost_of_revenue"),gross) ||
    !nearly(gross-costs.reduce((acc,key)=>acc+amount(key),0),amount("net_profit"))) {
  throw new Error("Profit flow does not reconcile to source financials.json");
}
const nodes = [
  {name:"收入"}, {name:"营业成本"}, {name:"毛利润"},
  {name:"研发费用"}, {name:"销售费用"}, {name:"管理费用"},
  {name:"其他净支出"}, {name:"净利润"}
];
const links = [
  {source:"收入",target:"营业成本",value:amount("cost_of_revenue")},
  {source:"收入",target:"毛利润",value:gross},
  {source:"毛利润",target:"研发费用",value:amount("rd_expense")},
  {source:"毛利润",target:"销售费用",value:amount("sales_expense")},
  {source:"毛利润",target:"管理费用",value:amount("admin_expense")},
  {source:"毛利润",target:"其他净支出",value:amount("other_net_expense")},
  {source:"毛利润",target:"净利润",value:amount("net_profit")}
];
const graph = sankey()
  .nodeId(d=>d.name).nodeWidth(18).nodePadding(16)
  .extent([[100,45],[710,378]])({
    nodes:nodes.map(d=>({...d})),
    links:links.map(d=>({...d}))
  });
const svg = select("#sankey");
const fill = d=>d.name==="净利润"?"#088b85":
  d.name==="收入"?"#265cbd":d.name==="毛利润"?"#2c9c91":"#c65a66";
svg.selectAll(".link").data(graph.links).enter().append("path")
  .attr("class","link").attr("d",sankeyLinkHorizontal())
  .attr("stroke",d=>fill(d.target)).attr("stroke-width",d=>Math.max(1,d.width))
  .attr("fill","none").attr("stroke-opacity",0.32)
  .append("title").text(d=>d.source.name+" → "+d.target.name+"："+d.value+" 亿元");
const g=svg.selectAll(".node").data(graph.nodes).enter().append("g").attr("class","node");
g.append("rect")
  .attr("x",d=>d.x0).attr("y",d=>d.y0)
  .attr("width",d=>d.x1-d.x0).attr("height",d=>d.y1-d.y0)
  .attr("rx",3).attr("fill",fill)
  .append("title").text(d=>d.name+"："+d.value+" 亿元");
g.append("text")
  .attr("x",d=>d.x0<200?d.x1+8:d.x0-8)
  .attr("y",d=>(d.y0+d.y1)/2)
  .attr("dy","0.35em")
  .attr("text-anchor",d=>d.x0<200?"start":"end")
  .attr("font-size",12).attr("fill","#243247")
  .text(d=>d.name+" "+d.value);
document.documentElement.dataset.ready="true";
