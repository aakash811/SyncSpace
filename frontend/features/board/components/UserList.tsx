import { usePresenceStore } from "../store/presence.store";

export default function UserList() {
    const users = usePresenceStore((state) => state.users);

    return (
        <div className="absolute top-4 right-4 bg-black/50 p-2 rounded">
            {users.map((userId) => (
               <div key={userId}>{users}</div> 
            ))}
        </div>
    )
}