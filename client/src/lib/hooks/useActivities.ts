import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import agent from "../api/agent";
import { useLocation } from "react-router";
import { useAccount } from "./useAccount";

export const useActivities = (id?: string) => {
    const queryClient = useQueryClient();
    const { currentUser } = useAccount();
    const location = useLocation();

    const { data: activities, isLoading } = useQuery({
        queryKey: ['activities'],
        queryFn: async () => {
            const response = await agent.get<Activity[]>('/activities');
            return response.data;
        },
        enabled: !id && location.pathname === '/activities' && !!currentUser,
        select: data => {
            return data.map(activity => ({
                ...activity,
                isHost: activity.hostId === currentUser?.id,
                isGoing: activity.attendees.some(a => a.id === currentUser?.id)
            }));
        }
    });

    const { data: activity, isLoading: isLoadingActivity } = useQuery({
        queryKey: ['activities', id],
        queryFn: async () => {
            const response = await agent.get<Activity>(`/activities/${id}`);
            return response.data;
        },
        enabled: !!id && !!currentUser,
        select: data => ({
            ...data,
            isHost: data.hostId === currentUser?.id,
            isGoing: data.attendees.some(a => a.id === currentUser?.id)
        })
    });

    const updateActivity = useMutation({
        mutationFn: async (activity: Activity) => {
            await agent.put<void>(`/activities`, activity);
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['activities'] });
        }
    });

    const createActivity = useMutation({
        mutationFn: async (activity: Activity) => {
            const response = await agent.post<void>(`/activities`, activity);
            return response.data;
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['activities'] });
        }
    });

    const deleteActivity = useMutation({
        mutationFn: async (id: string) => {
            await agent.delete<void>(`/activities/${id}`);
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['activities'] });
        }
    });

    const updateAttendance = useMutation({
        mutationFn: async (id: string) => {
            await agent.post<void>(`/activities/${id}/attend`);
        },
        onMutate: async (activityId: string) => {
            await queryClient.cancelQueries({ queryKey: ['activities', activityId] });
            const prevActivity = queryClient.getQueryData<Activity>(['activities', activityId]);
            queryClient.setQueryData<Activity>(['activities', activityId], oldActivity => {
                if (!oldActivity || !currentUser) return oldActivity;

                const isHost = oldActivity.hostId === currentUser.id;
                const isAttending = oldActivity.attendees.some(a => a.id === currentUser.id);

                return {
                    ...oldActivity,
                    isCancelled: isHost ? !oldActivity.isCancelled : oldActivity.isCancelled,
                    attendees: isAttending
                        ? isHost
                            ? oldActivity.attendees
                            : oldActivity.attendees.filter(a => a.id !== currentUser.id)
                        : [...oldActivity.attendees, {
                            id: currentUser.id,
                            displayName: currentUser.displayName,
                            imageUrl: currentUser.imageUrl
                        }]
                };
            });

            return { prevActivity };
        },
        onError: (error, activityId, context) => {
            console.error(error);
            if (context?.prevActivity) {
                queryClient.setQueryData<Activity>(['activities', activityId], context.prevActivity);
            }
        }
    });

    return {
        activities,
        isLoading,
        activity,
        isLoadingActivity,
        updateActivity,
        createActivity,
        deleteActivity,
        updateAttendance
    };
}