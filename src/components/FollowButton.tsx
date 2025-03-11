"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { LoaderIcon } from "lucide-react";
import toast from "react-hot-toast";
import { toggleFollow } from "@/actions/user.action";

const FollowButton = ({ userId }: { userId: number }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleFollow = async () => {
    setIsLoading(true);
    try {
      await toggleFollow(userId);
      toast.success("User followed successfully");
    } catch (error) {
      toast.error("Failed to follow user");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      className="w-20"
      size={"sm"}
      variant={"secondary"}
      onClick={handleFollow}
      disabled={isLoading}
    >
      {isLoading ? <LoaderIcon className="size-4 animate-spin" /> : "Follow"}
    </Button>
  );
};

export default FollowButton;
