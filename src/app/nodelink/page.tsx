'use client'

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { AppLayout } from '@/components/AppLayout';
import { SpotlightSearch } from '@/components/SpotlightSearch';
import { useSpotlightSearch } from '@/hooks/useSpotlightSearch';
import { CheckCircle2, AlertCircle, Zap, ChevronDown, ChevronUp } from 'lucide-react';

interface NodelinkNode {
  name: string;
  host: string;
  port: number;
  online: boolean;
  secure: boolean;
  showDetails: boolean;
  stats?: {
    playingPlayers: number;
    players: number;
    uptime: number;
    memory: {
      used: number;
      allocated: number;
      reservable: number;
    };
    cpu: {
      cores: number;
      systemLoad: number;
      lavalinkLoad: number;
    };
  };
}

interface NodelinkResponse {
  nodes: NodelinkNode[];
  totalNodes: number;
  onlineNodes: number;
  offlineNodes: number;
}

export default function NodelinkPage() {
  const { data: session } = useSession();
  const { isOpen, openSpotlight, closeSpotlight } = useSpotlightSearch();
  const [data, setData] = useState<NodelinkResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const isEnabled = process.env.NEXT_PUBLIC_NODELINK_ENABLED !== 'false';

  const toggleNodeDetails = (nodeName: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeName)) {
      newExpanded.delete(nodeName);
    } else {
      newExpanded.add(nodeName);
    }
    setExpandedNodes(newExpanded);
  };

  const formatBytes = (bytes: number) => {
    return (bytes / 1024 / 1024).toFixed(1);
  };

  const formatUptime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
    if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  useEffect(() => {
    const fetchNodes = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/nodelink/nodes');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        setData(data);
        
        // Expand public nodes by default
        const publicNodes = new Set<string>(
          data.nodes
            .filter((node: NodelinkNode) => node.showDetails)
            .map((node: NodelinkNode) => node.name)
        );
        setExpandedNodes(publicNodes);
      } catch (err: any) {
        console.error('Error fetching nodes:', err);
        setError(err.message || 'Failed to load Nodelink nodes');
      } finally {
        setLoading(false);
      }
    };

    fetchNodes();
    const interval = setInterval(fetchNodes, 10000);
    return () => clearInterval(interval);
  }, []);

  if (!isEnabled) {
    return (
      <>
        <SpotlightSearch guildId="" isOpen={isOpen} onClose={closeSpotlight} />
        <AppLayout guildId={undefined} requesterId={session?.user?.id || ''} onOpenSpotlight={openSpotlight}>
          <div className="flex-1 p-8">
            <div className="max-w-7xl mx-auto">
              <div className="text-center py-12">
                <div className="text-zinc-400 text-lg">Nodelink page is currently disabled</div>
              </div>
            </div>
          </div>
        </AppLayout>
      </>
    );
  }

  return (
    <>
      <SpotlightSearch guildId="" isOpen={isOpen} onClose={closeSpotlight} />
      <AppLayout guildId={undefined} requesterId={session?.user?.id || ''} onOpenSpotlight={openSpotlight}>
        <div className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <Zap className="w-8 h-8 text-yellow-500" />
              <h1 className="text-3xl font-bold">Nodelink Nodes</h1>
            </div>

            {loading && <div className="text-zinc-400">Loading nodes...</div>}
            {error && <div className="text-red-400">{error}</div>}

            {data && (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-700 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-zinc-400 text-sm mb-1">Total Nodes</div>
                        <div className="text-4xl font-bold text-white">{data.totalNodes}</div>
                      </div>
                      <Zap className="w-12 h-12 text-zinc-700" />
                    </div>
                  </div>

                  <div className="bg-zinc-900 p-6 rounded-lg border border-green-900/50 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-green-400 text-sm mb-1">Online Nodes</div>
                        <div className="text-4xl font-bold text-green-400">{data.onlineNodes}</div>
                      </div>
                      <CheckCircle2 className="w-12 h-12 text-green-500" />
                    </div>
                  </div>

                  <div className="bg-zinc-900 p-6 rounded-lg border border-red-900/50 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-red-400 text-sm mb-1">Offline Nodes</div>
                        <div className="text-4xl font-bold text-red-400">{data.offlineNodes}</div>
                      </div>
                      <AlertCircle className="w-12 h-12 text-red-500" />
                    </div>
                  </div>
                </div>

                {/* Nodes List */}
                <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-700 shadow-lg">
                  <h2 className="text-xl font-semibold text-white mb-6">Node Details</h2>
                  
                  {data.nodes.length === 0 ? (
                    <div className="text-center text-zinc-400 py-12">
                      No Nodelink nodes configured
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {data.nodes.map((node) => {
                        const isExpanded = expandedNodes.has(node.name);
                        return (
                          <div
                            key={node.name}
                            className="bg-zinc-800/50 rounded-lg border border-zinc-700 hover:border-zinc-600 transition-colors overflow-hidden"
                          >
                            <button
                              onClick={() => toggleNodeDetails(node.name)}
                              className="w-full flex items-center justify-between p-4 hover:bg-zinc-800/70 transition-colors"
                            >
                              <div className="flex items-center gap-4 flex-1 text-left">
                                <div
                                  className={`h-3 w-3 rounded-full flex-shrink-0 ${
                                    node.online ? 'bg-green-500' : 'bg-red-500'
                                  }`}
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <div className="font-semibold text-white truncate">{node.name}</div>
                                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                      node.showDetails 
                                        ? 'bg-blue-900/50 text-blue-300 border border-blue-700' 
                                        : 'bg-purple-900/50 text-purple-300 border border-purple-700'
                                    }`}>
                                      {node.showDetails ? 'Public' : 'Private'}
                                    </span>
                                  </div>
                                  {node.showDetails && (
                                    <div className="text-sm text-zinc-400">
                                      {node.host}:{node.port}
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-4 ml-4">
                                <div className="text-right">
                                  <div className={`text-sm font-medium ${
                                    node.online ? 'text-green-400' : 'text-red-400'
                                  }`}>
                                    {node.online ? 'Online' : 'Offline'}
                                  </div>
                                </div>
                                {node.showDetails && (
                                  <div className="text-zinc-400">
                                    {isExpanded ? (
                                      <ChevronUp className="w-5 h-5" />
                                    ) : (
                                      <ChevronDown className="w-5 h-5" />
                                    )}
                                  </div>
                                )}
                              </div>
                            </button>

                            {isExpanded && node.showDetails && (
                              <div className="px-4 pb-4 border-t border-zinc-700 bg-zinc-900/50">
                                <div className="mt-4 space-y-4">
                                  {/* Connection Details */}
                                  <div>
                                    <h3 className="text-sm font-semibold text-zinc-300 mb-2">Connection</h3>
                                    <div className="grid grid-cols-2 gap-2">
                                      <div className="bg-zinc-800 p-2 rounded text-xs">
                                        <div className="text-zinc-400 mb-1">Host</div>
                                        <div className="font-mono text-white break-all">{node.host}</div>
                                      </div>
                                      <div className="bg-zinc-800 p-2 rounded text-xs">
                                        <div className="text-zinc-400 mb-1">Port</div>
                                        <div className="font-mono text-white">{node.port}</div>
                                      </div>
                                      <div className="bg-zinc-800 p-2 rounded text-xs">
                                        <div className="text-zinc-400 mb-1">Secure</div>
                                        <div className="font-mono text-white">{node.secure ? 'true' : 'false'}</div>
                                      </div>
                                      <div className="bg-zinc-800 p-2 rounded text-xs">
                                        <div className="text-zinc-400 mb-1">Status</div>
                                        <div className={`font-mono ${node.online ? 'text-green-400' : 'text-red-400'}`}>
                                          {node.online ? 'Online' : 'Offline'}
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Stats */}
                                  {node.online && node.stats && (
                                    <>
                                      <div>
                                        <h3 className="text-sm font-semibold text-zinc-300 mb-2">CPU & System</h3>
                                        <div className="grid grid-cols-2 gap-2">
                                          <div className="bg-zinc-800 p-2 rounded text-xs">
                                            <div className="text-zinc-400 mb-1">Cores</div>
                                            <div className="font-mono text-white">{node.stats.cpu.cores}</div>
                                          </div>
                                          <div className="bg-zinc-800 p-2 rounded text-xs">
                                            <div className="text-zinc-400 mb-1">System Load</div>
                                            <div className="font-mono text-white">{node.stats.cpu.systemLoad.toFixed(3)}</div>
                                          </div>
                                          <div className="bg-zinc-800 p-2 rounded text-xs">
                                            <div className="text-zinc-400 mb-1">Node Load</div>
                                            <div className="font-mono text-white">{node.stats.cpu.lavalinkLoad.toFixed(3)}</div>
                                          </div>
                                          <div className="bg-zinc-800 p-2 rounded text-xs">
                                            <div className="text-zinc-400 mb-1">Uptime</div>
                                            <div className="font-mono text-white">{formatUptime(node.stats.uptime)}</div>
                                          </div>
                                        </div>
                                      </div>

                                      <div>
                                        <h3 className="text-sm font-semibold text-zinc-300 mb-2">Memory</h3>
                                        <div className="grid grid-cols-3 gap-2">
                                          <div className="bg-zinc-800 p-2 rounded text-xs">
                                            <div className="text-zinc-400 mb-1">Used</div>
                                            <div className="font-mono text-white">{formatBytes(node.stats.memory.used)} MB</div>
                                          </div>
                                          <div className="bg-zinc-800 p-2 rounded text-xs">
                                            <div className="text-zinc-400 mb-1">Allocated</div>
                                            <div className="font-mono text-white">{formatBytes(node.stats.memory.allocated)} MB</div>
                                          </div>
                                          <div className="bg-zinc-800 p-2 rounded text-xs">
                                            <div className="text-zinc-400 mb-1">Reservable</div>
                                            <div className="font-mono text-white">{formatBytes(node.stats.memory.reservable)} MB</div>
                                          </div>
                                        </div>
                                      </div>

                                      <div>
                                        <h3 className="text-sm font-semibold text-zinc-300 mb-2">Players</h3>
                                        <div className="bg-zinc-800 p-2 rounded text-xs">
                                          <div className="text-zinc-400 mb-1">Active / Total</div>
                                          <div className="font-mono text-white">{node.stats.playingPlayers} / {node.stats.players}</div>
                                        </div>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </AppLayout>
    </>
  );
}
