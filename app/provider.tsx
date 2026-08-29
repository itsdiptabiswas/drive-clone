"use client";

import store, { AppStore, useAppDispatch } from "@app/store";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { ConfigProvider } from "antd";
import dynamic from "next/dynamic";
import { SessionProvider } from "next-auth/react";
import { PropsWithChildren, useEffect, useRef } from "react";
import { Provider } from "react-redux";
import { Toaster } from 'sonner';
import AlertModal from "./components/alert";
import Notifications from "./components/notification";
import { EffectiveConnectionType } from "./interfaces/index.interface";
import { addNetworkQuality } from "./store/actions/network.actions";
import { getImageQuality } from "./utils/index.utils";

const ReactQueryDevtools = dynamic(
	() => import('@tanstack/react-query-devtools').then(m => ({ default: m.ReactQueryDevtools })),
	{ ssr: false }
);

const queryClient = new QueryClient();

export function StoreProvider({ children }: PropsWithChildren) {
	const storeRef = useRef<AppStore>();
	if (!storeRef.current) {
		// Create the store instance the first time this renders
		storeRef.current = store;
	}

	return <Provider store={storeRef.current}>{children}</Provider>;
}

const AppClientProvider = ({ children }: PropsWithChildren) => {
	return (

		<SessionProvider>
			<QueryClientProvider client={queryClient}>
				<StoreProvider>
					<ConfigProvider theme={{ token: { zIndexPopupBase: 1090 } }}>
						{children}
						<Toaster
							position="bottom-center"
							visibleToasts={2}
							closeButton={true}
							toastOptions={{
								className: "toast-message"
							}} duration={10000}
						/>
					</ConfigProvider>
					<Notifications />
					<AlertModal />
					<NetworkSpeedMonitor />
				</StoreProvider>
				{process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
			</QueryClientProvider>
			<BootstrapClient />
		</SessionProvider>
	);
};

function BootstrapClient() {
	useEffect(() => {
		Promise.all([
			import("bootstrap/js/dist/modal"),
			import("bootstrap/js/dist/dropdown"),
			import("bootstrap/js/dist/collapse"),
		]);
	}, []);

	return null;
}


function NetworkSpeedMonitor() {
	const { isFetched, data } = useQuery({ queryFn: getImageQuality, queryKey: ["network"], refetchOnWindowFocus: true, staleTime: 1000 * 15 })
	const dispatch = useAppDispatch()

	useEffect(() => {
		if (isFetched && data) {
			dispatch(addNetworkQuality(data as EffectiveConnectionType))
		}
	}, [isFetched, data, dispatch])

	return null

}

export default AppClientProvider;
