/*******************************************************************************
 * Copyright (c) 2008-2024 Maxprograms.
 *
 * This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License 1.0
 * which accompanies this distribution, and is available at
 * https://www.eclipse.org/org/documents/epl-v10.html
 *
 * Contributors:
 *     Maxprograms - initial API and implementation
 *******************************************************************************/

package com.maxprograms.remotetm;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;

public class RemoteTM {
    
    private static File workDir;

	private RemoteTM() {
		// private for security
	}

    public static File getWorkFolder() throws IOException {
		if (workDir == null) {
			String os = System.getProperty("os.name").toLowerCase();
			if (os.startsWith("mac")) {
				workDir = new File(System.getProperty("user.home") + "/Library/Application Support/RemoteTM/");
			} else if (os.startsWith("windows")) {
				workDir = new File(System.getenv("AppData") + "\\RemoteTM\\");
			} else {
				workDir = new File(System.getProperty("user.home") + "/.config/RemoteTM/");
			}
			if (!workDir.exists()) {
				Files.createDirectories(workDir.toPath());
			}
		}
		return workDir;
	}
}
