import { NextResponse } from 'next/server';

interface NodelinkNodeConfig {
  name: string;
  host: string;
  port: number;
  password: string;
  secure?: boolean;
  showDetails?: boolean;
}

interface NodelinkStats {
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
}

function getNodelinkNodes(): NodelinkNodeConfig[] {
  const nodesJson = process.env.LAVALINK_NODES || process.env.NODELINK_NODES;
  
  if (!nodesJson) {
    return [];
  }

  try {
    return JSON.parse(nodesJson);
  } catch (error) {
    console.error('Failed to parse LAVALINK_NODES or NODELINK_NODES:', error);
    return [];
  }
}

async function checkNodeStatus(node: NodelinkNodeConfig): Promise<{ online: boolean; stats?: NodelinkStats }> {
  try {
    const protocol = node.secure ? 'https' : 'http';
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(
      `${protocol}://${node.host}:${node.port}/v4/stats`,
      {
        headers: {
          'Authorization': node.password,
        },
        signal: controller.signal,
      }
    );
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      const stats = await response.json();
      return {
        online: true,
        stats: {
          playingPlayers: stats.playingPlayers || 0,
          players: stats.players || 0,
          uptime: stats.uptime || 0,
          memory: {
            used: stats.memory?.used || 0,
            allocated: stats.memory?.allocated || 0,
            reservable: stats.memory?.reservable || 0,
          },
          cpu: {
            cores: stats.cpu?.cores || 0,
            systemLoad: stats.cpu?.systemLoad || 0,
            lavalinkLoad: stats.cpu?.lavalinkLoad || 0,
          },
        },
      };
    }
    return { online: false };
  } catch (error) {
    return { online: false };
  }
}

export async function GET() {
  try {
    const nodeConfigs = getNodelinkNodes();
    
    const nodesWithStatus = await Promise.all(
      nodeConfigs.map(async (node) => {
        const { online, stats } = await checkNodeStatus(node);
        return {
          name: node.name,
          host: node.host,
          port: node.port,
          online,
          secure: node.secure || false,
          showDetails: node.showDetails !== false,
          password: node.showDetails !== false ? node.password : undefined,
          stats,
        };
      })
    );

    const totalNodes = nodesWithStatus.length;
    const onlineNodes = nodesWithStatus.filter(n => n.online).length;
    const offlineNodes = totalNodes - onlineNodes;

    return NextResponse.json({
      nodes: nodesWithStatus,
      totalNodes,
      onlineNodes,
      offlineNodes,
    });
  } catch (error) {
    console.error('Error fetching Nodelink nodes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Nodelink nodes' },
      { status: 500 }
    );
  }
}
