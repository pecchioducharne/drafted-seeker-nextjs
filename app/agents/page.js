'use client';

import React, { useState, useEffect } from 'react';

export default function AgentsDashboard() {
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [responses, setResponses] = useState([
    {
      id: 1,
      agentType: 'Data Annotation',
      from: 'sam@openai.com',
      fromName: 'Sam Altman',
      company: 'OpenAI',
      subject: 'Re: High-quality data annotation for OpenAI\'s AI training',
      message: 'Hi Ashley, interesting timing. We\'re actually looking into this right now. Can we schedule a call next week?',
      timestamp: '2 hours ago',
      status: 'unread'
    },
    {
      id: 2,
      agentType: 'Investor',
      from: 'sarah@conviction.com',
      fromName: 'Sarah Guo',
      company: 'Conviction',
      subject: 'Re: Drafted - RLHF from verified university students',
      message: 'Rodrigo, this is compelling. I\'d like to learn more. Free Thursday 2pm?',
      timestamp: '5 hours ago',
      status: 'unread'
    },
    {
      id: 3,
      agentType: 'Recruitment',
      from: 'jane@anthropic.com',
      fromName: 'Jane Smith',
      company: 'Anthropic',
      subject: 'Re: Top 3 candidates for Anthropic\'s Senior ML Engineer role',
      message: 'Thanks for reaching out! The second candidate looks great. Can you intro us?',
      timestamp: '1 day ago',
      status: 'read'
    },
    {
      id: 4,
      agentType: 'Investor',
      from: 'martin@a16z.com',
      fromName: 'Martin Casado',
      company: 'a16z',
      subject: 'Re: Drafted - RLHF from verified university students',
      message: 'Hey Rodrigo, let\'s chat. I know Tal well. When works for you?',
      timestamp: '1 day ago',
      status: 'read'
    }
  ]);
  
  const [agents, setAgents] = useState([
    {
      id: 'recruitment',
      name: 'Recruitment Agent',
      status: 'active',
      lastRun: '2 minutes ago',
      emailsSent: 47,
      responses: 3,
      responseRate: '6.4%',
      cost: '$0.71'
    },
    {
      id: 'data-annotation',
      name: 'Data Annotation Agent',
      status: 'active',
      lastRun: '5 minutes ago',
      emailsSent: 18,
      responses: 1,
      responseRate: '5.6%',
      cost: '$1.44'
    },
    {
      id: 'investor',
      name: 'Investor Agent',
      status: 'active',
      lastRun: '8 minutes ago',
      emailsSent: 12,
      responses: 0,
      responseRate: '0%',
      cost: '$1.08'
    }
  ]);

  const [costs, setCosts] = useState({
    openai: { used: 1250, limit: 10000, cost: 37.50 },
    apollo: { used: 45, limit: 2000, cost: 2.25 },
    hunter: { used: 12, limit: 150, cost: 8.04 },
    resend: { used: 77, limit: 3000, cost: 0 },
    brightData: { used: 89, limit: null, cost: 0.18 }
  });

  const [totalStats, setTotalStats] = useState({
    totalEmails: 77,
    totalResponses: 4,
    totalCost: 49.47,
    avgResponseRate: '5.2%'
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'paused':
        return 'bg-yellow-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getCostColor = (used, limit) => {
    if (!limit) return 'text-gray-600';
    const percentage = (used / limit) * 100;
    if (percentage >= 80) return 'text-red-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-green-600';
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert(`Copied: ${text}`);
  };

  const unreadCount = responses.filter(r => r.status === 'unread').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <div className="border-b border-gray-700 bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Agent Dashboard</h1>
              <p className="text-gray-400 mt-1">Monitor autonomous agents working 24/7</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-400">Total Spend Today</p>
                <p className="text-2xl font-bold text-green-400">${totalStats.totalCost.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
            <p className="text-gray-400 text-sm">Total Emails Sent</p>
            <p className="text-3xl font-bold text-white mt-2">{totalStats.totalEmails}</p>
            <p className="text-green-400 text-sm mt-1">↑ 12% from yesterday</p>
          </div>
          <div 
            className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6 cursor-pointer hover:border-green-500/50 transition-all"
            onClick={() => setShowResponseModal(true)}
          >
            <div className="flex items-center justify-between">
              <p className="text-gray-400 text-sm">Total Responses</p>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">{unreadCount}</span>
              )}
            </div>
            <p className="text-3xl font-bold text-white mt-2">{totalStats.totalResponses}</p>
            <p className="text-gray-400 text-sm mt-1">{totalStats.avgResponseRate} response rate</p>
            <p className="text-green-400 text-xs mt-2">Click to view →</p>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
            <p className="text-gray-400 text-sm">Active Agents</p>
            <p className="text-3xl font-bold text-white mt-2">3</p>
            <p className="text-green-400 text-sm mt-1">All running</p>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
            <p className="text-gray-400 text-sm">Daily Cost</p>
            <p className="text-3xl font-bold text-white mt-2">${totalStats.totalCost.toFixed(2)}</p>
            <p className="text-gray-400 text-sm mt-1">~$96/month projected</p>
          </div>
        </div>

        {/* Agent Status Cards */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Agent Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {agents.map((agent) => (
              <div
                key={agent.id}
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6 hover:border-green-500/50 transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">{agent.name}</h3>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(agent.status)} animate-pulse`}></div>
                    <span className="text-sm text-gray-400 capitalize">{agent.status}</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Last Run</span>
                    <span className="text-white">{agent.lastRun}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Emails Sent</span>
                    <span className="text-white font-semibold">{agent.emailsSent}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Responses</span>
                    <span className="text-green-400 font-semibold">{agent.responses}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Response Rate</span>
                    <span className="text-white">{agent.responseRate}</span>
                  </div>
                  <div className="flex justify-between text-sm pt-2 border-t border-gray-700">
                    <span className="text-gray-400">Cost Today</span>
                    <span className="text-white font-semibold">{agent.cost}</span>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <button className="flex-1 bg-green-500/10 hover:bg-green-500/20 text-green-400 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                    View Details
                  </button>
                  <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors">
                    ⚙️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cost Tracking Panel */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Service Costs & Credits</h2>
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
            <div className="space-y-4">
              {/* OpenAI */}
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">OpenAI</span>
                    <span className={`text-sm font-semibold ${getCostColor(costs.openai.used, costs.openai.limit)}`}>
                      {costs.openai.used.toLocaleString()} / {costs.openai.limit.toLocaleString()} tokens
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all"
                      style={{ width: `${(costs.openai.used / costs.openai.limit) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <span className="ml-4 text-white font-semibold">${costs.openai.cost.toFixed(2)}</span>
              </div>

              {/* Apollo */}
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">Apollo.io</span>
                    <span className={`text-sm font-semibold ${getCostColor(costs.apollo.used, costs.apollo.limit)}`}>
                      {costs.apollo.used} / {costs.apollo.limit} credits
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${(costs.apollo.used / costs.apollo.limit) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <span className="ml-4 text-white font-semibold">${costs.apollo.cost.toFixed(2)}</span>
              </div>

              {/* Hunter */}
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">Hunter.io</span>
                    <span className={`text-sm font-semibold ${getCostColor(costs.hunter.used, costs.hunter.limit)}`}>
                      {costs.hunter.used} / {costs.hunter.limit} searches
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full transition-all"
                      style={{ width: `${(costs.hunter.used / costs.hunter.limit) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <span className="ml-4 text-white font-semibold">${costs.hunter.cost.toFixed(2)}</span>
              </div>

              {/* Resend */}
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">Resend</span>
                    <span className={`text-sm font-semibold ${getCostColor(costs.resend.used, costs.resend.limit)}`}>
                      {costs.resend.used} / {costs.resend.limit} emails
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-yellow-500 h-2 rounded-full transition-all"
                      style={{ width: `${(costs.resend.used / costs.resend.limit) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <span className="ml-4 text-green-400 font-semibold">FREE</span>
              </div>

              {/* Bright Data */}
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">Bright Data</span>
                    <span className="text-sm font-semibold text-gray-400">
                      {costs.brightData.used} requests
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-orange-500 h-2 rounded-full transition-all" style={{ width: '15%' }}></div>
                  </div>
                </div>
                <span className="ml-4 text-white font-semibold">${costs.brightData.cost.toFixed(2)}</span>
              </div>
            </div>

            {/* Total */}
            <div className="mt-6 pt-4 border-t border-gray-700 flex justify-between items-center">
              <span className="text-lg font-semibold text-white">Total Daily Cost</span>
              <span className="text-2xl font-bold text-green-400">${totalStats.totalCost.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Agent
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Recipient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Subject
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  <tr className="hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-blue-500/10 text-blue-400 rounded">
                        Recruitment
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">jane@anthropic.com</td>
                    <td className="px-6 py-4 text-sm text-gray-300">Top 3 candidates for Senior ML Engineer</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-green-500/10 text-green-400 rounded">
                        Sent
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">2 min ago</td>
                  </tr>
                  <tr className="hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-purple-500/10 text-purple-400 rounded">
                        Investor
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">john@sequoia.com</td>
                    <td className="px-6 py-4 text-sm text-gray-300">Drafted - Gen Z RLHF at scale</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-green-500/10 text-green-400 rounded">
                        Sent
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">8 min ago</td>
                  </tr>
                  <tr className="hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-yellow-500/10 text-yellow-400 rounded">
                        Data Annotation
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">sam@openai.com</td>
                    <td className="px-6 py-4 text-sm text-gray-300">High-quality data annotation for AI training</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-yellow-500/10 text-yellow-400 rounded">
                        Opened
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">15 min ago</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Response Modal */}
        {showResponseModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 border border-gray-700 rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto">
              <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">Email Responses</h2>
                  <p className="text-gray-400 text-sm mt-1">{responses.length} total responses · {unreadCount} unread</p>
                </div>
                <button 
                  onClick={() => setShowResponseModal(false)}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                {/* Info Banner */}
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                  <div className="flex gap-3">
                    <span className="text-blue-400 text-xl">ℹ️</span>
                    <div>
                      <p className="text-blue-300 font-medium">Sample Data</p>
                      <p className="text-blue-200/70 text-sm mt-1">
                        These are example responses. Real responses will appear here after Tuesday's email campaign is sent. 
                        All replies will also be forwarded to <span className="font-mono">rodrigo@gotdrafted.com</span>
                      </p>
                    </div>
                  </div>
                </div>
                
                {responses.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-400">No responses yet</p>
                    <p className="text-gray-500 text-sm mt-2">Responses will appear here once people reply to your outreach</p>
                  </div>
                ) : (
                  responses.map((response) => (
                    <div 
                      key={response.id}
                      className={`bg-gray-900/50 border rounded-lg p-5 ${
                        response.status === 'unread' ? 'border-green-500/50' : 'border-gray-700'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className={`px-2 py-1 text-xs font-medium rounded ${
                              response.agentType === 'Investor' 
                                ? 'bg-purple-500/10 text-purple-400'
                                : response.agentType === 'Data Annotation'
                                ? 'bg-yellow-500/10 text-yellow-400'
                                : 'bg-blue-500/10 text-blue-400'
                            }`}>
                              {response.agentType}
                            </span>
                            {response.status === 'unread' && (
                              <span className="px-2 py-1 text-xs font-medium bg-red-500/10 text-red-400 rounded">
                                NEW
                              </span>
                            )}
                            <span className="text-gray-500 text-xs">{response.timestamp}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-white font-semibold">{response.fromName}</h3>
                            <span className="text-gray-400 text-sm">· {response.company}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-gray-400 text-sm font-mono">{response.from}</p>
                            <button
                              onClick={() => copyToClipboard(response.from)}
                              className="text-green-400 hover:text-green-300 text-xs bg-gray-800 px-2 py-1 rounded"
                            >
                              Copy
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="border-t border-gray-700 pt-3 mt-3">
                        <p className="text-gray-300 font-medium mb-2">Re: {response.subject}</p>
                        <p className="text-gray-400 text-sm leading-relaxed">{response.message}</p>
                      </div>
                      
                      <div className="mt-4 flex gap-2">
                        <button className="bg-green-500/10 text-green-400 hover:bg-green-500/20 px-4 py-2 rounded text-sm font-medium transition-colors">
                          Reply via Email
                        </button>
                        <button className="bg-gray-700/50 text-gray-300 hover:bg-gray-700 px-4 py-2 rounded text-sm font-medium transition-colors">
                          Mark as Read
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
