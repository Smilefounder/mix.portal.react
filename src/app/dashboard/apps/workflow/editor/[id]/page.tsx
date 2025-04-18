'use client';

// The generateStaticParams function has been moved to a separate file: generateStaticParams.ts

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { WorkflowEditor } from '../../components/editor/WorkflowEditor';

export default function WorkflowEditorWithIdPage() {
  const params = useParams();
  const id = params.id as string;
  
  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="absolute top-0 left-0 z-20 m-4">
        <Link 
          href="/dashboard/apps?app=workflow" 
          className="flex items-center gap-1 text-sm bg-background/90 backdrop-blur-sm hover:bg-background border rounded-md px-3 py-1.5 shadow-md hover:shadow-lg transition-all"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Workflows
        </Link>
      </div>
      
      {/* Full-height/width editor */}
      <div className="h-full flex-1">
        <WorkflowEditor workflowId={id} />
      </div>
    </div>
  );
} 