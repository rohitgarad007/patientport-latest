import { Ward, BedStats } from '@/types/bedManagement';

export const calculateStats = (wards: Ward[]): BedStats => {
  let available = 0;
  let occupied = 0;
  let reserved = 0;
  let total = 0;

  wards.forEach(ward => {
    ward.rooms.forEach(room => {
      room.beds.forEach(bed => {
        total++;
        if (bed.status === 'available') available++;
        else if (bed.status === 'occupied') occupied++;
        else if (bed.status === 'reserved') reserved++;
      });
    });
  });

  const occupancyRate = total > 0 ? Math.round(((occupied + reserved) / total) * 100) : 0;

  return { available, occupied, reserved, total, occupancyRate };
};

export const calculateWardStats = (ward: Ward): BedStats => {
  return calculateStats([ward]);
};
