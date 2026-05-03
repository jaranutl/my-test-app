"use client"

import { Provider } from "react-redux"
import { store } from "@/store/store"
import { MantineProvider } from "@mantine/core"
import "@mantine/core/styles.css"

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <MantineProvider>
            <Provider store={store}>{children}</Provider>
        </MantineProvider>
    )
}
