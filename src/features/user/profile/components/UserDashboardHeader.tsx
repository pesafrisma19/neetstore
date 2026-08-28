import React from 'react';
import { Card } from '../../../../components/ui/Card';
import { Badge } from '../../../../components/ui/Badge';
import { Avatar } from '../../../../components/ui/Avatar';
import { ShieldCheck } from 'lucide-react';
import type { UserProfile } from '../../../../contexts/AuthContext';

interface UserDashboardHeaderProps {
  user: UserProfile;
}

export const UserDashboardHeader: React.FC<UserDashboardHeaderProps> = ({ user }) => {
  return (
    <Card variant="yellow" shadow="md" className="p-4 sm:p-5 mb-6 border-[3px] rounded-2xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Left: Avatar + Details */}
        <div className="flex items-center gap-3.5 min-w-0">
          <Avatar
            fallback={user.username ? user.username.substring(0, 2).toUpperCase() : 'US'}
            variant="pink"
            size="md"
            className="border-[2.5px] border-black shadow-[2px_2px_0px_0px_#000] shrink-0"
          />
          <div className="space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black uppercase text-black m-0 truncate">
                {user.username}
              </h1>
              <Badge
                variant={user.level === 'VIP' ? 'pink' : user.level === 'RESELLER' ? 'purple' : 'mint'}
                size="sm"
                className="font-black text-[10px] py-0.5 px-2"
              >
                {user.level} MEMBER
              </Badge>
              {user.verified && (
                <Badge variant="mint" size="sm" className="flex items-center gap-1 font-black text-[10px] py-0.5 px-2">
                  <ShieldCheck className="w-3 h-3 stroke-[3]" /> VERIFIED
                </Badge>
              )}
              {user.role === 'ADMIN' && (
                <Badge variant="yellow" size="sm" className="font-black text-[10px] py-0.5 px-2">
                  ADMIN
                </Badge>
              )}
            </div>
            <p className="text-[11px] font-bold text-black/80 font-mono truncate m-0">
              {user.fullname ? `${user.fullname} • ` : ''}
              {user.email || user.phone || 'Belum Melengkapi Kontak'}
            </p>
          </div>
        </div>

        {/* Right: Small Member ID badge */}
        <div className="self-end sm:self-center shrink-0">
          <span className="text-[10px] font-mono font-bold text-black/70 bg-black/10 px-2 py-0.5 rounded border border-black/20">
            ID: #{user.id}
          </span>
        </div>
      </div>
    </Card>
  );
};
