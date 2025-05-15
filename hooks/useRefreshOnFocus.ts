import { useAuth } from "@/app/context/auth";
import { useQueryClient } from "@tanstack/react-query";
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";

const useRefreshOnFocus = (
    queryKey: string | string[],
    refetchFn: () => Promise<any>,
    dependencies: any[] = []
  ): void => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
  
    useFocusEffect(
      useCallback(() => {
        if (user?.id) {
          queryClient.invalidateQueries({ 
            queryKey: Array.isArray(queryKey) ? queryKey : [queryKey] 
          });
          refetchFn().catch(error => console.error('Error refreshing data:', error));
        }
      }, [queryClient, refetchFn, user?.id, queryKey, ...dependencies])
    );
  };

export default useRefreshOnFocus;